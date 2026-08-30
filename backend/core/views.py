from django.http import JsonResponse
from rest_framework import generics
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from .models import Document, ChatMessage
from .serializers import DocumentSerializer
from .text_extraction import extract_text
from .chunking import chunk_text
from .embeddings import generate_embeddings
from .vectorstore import add_chunks_to_store, query_store
from .prompt_builder import build_prompt
from .llm import get_answer_from_llm


def hello_api(request):
    return JsonResponse({"message": "Hello from Django!"})


class UploadDocumentView(generics.CreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        document = serializer.save(
            original_filename=file_obj.name,
            user=self.request.user
        )

        try:
            extracted = extract_text(document.file.path)
        except Exception as e:
            document.delete()
            raise ValidationError(
                f"Could not extract text from this file: {str(e)}"
            )

        if not extracted or not extracted.strip():
            document.delete()
            raise ValidationError(
                "No readable text found in this file. "
                "It may be a scanned/image-only document."
            )

        document.extracted_text = extracted
        document.save()

        try:
            chunks = chunk_text(extracted)
            embeddings = generate_embeddings(chunks)
            add_chunks_to_store(document.id, chunks, embeddings)
        except Exception as e:
            document.delete()
            raise ValidationError(
                f"Failed to process document for search: {str(e)}"
            )


class QueryDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        document_id = request.data.get('document_id')
        question = request.data.get('question')

        if not document_id or not question:
            return Response(
                {'error': 'document_id and question are required'},
                status=400
            )

        try:
            document = Document.objects.get(
                id=document_id,
                user=request.user
            )
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'},
                status=404
            )

        try:
            query_embedding = generate_embeddings([question])[0]

            # Search only inside the document selected by the user.
            results = query_store(
                document_id,
                query_embedding,
                top_k=3
            )

            chunks = results['documents'][0]

        except Exception as e:
            return Response(
                {'error': f'Retrieval failed: {str(e)}'},
                status=500
            )

        if not chunks:
            return Response(
                {'error': 'No relevant content found in this document.'},
                status=404
            )

        chat_history = (
            ChatMessage.objects
            .filter(document=document)
            .order_by('-created_at')[:3][::-1]
        )

        prompt = build_prompt(
            question,
            chunks,
            chat_history=chat_history
        )

        try:
            answer = get_answer_from_llm(prompt)
        except Exception as e:
            return Response(
                {
                    'error':
                    'LLM request failed. This may be a temporary issue — '
                    f'please try again. ({str(e)})'
                },
                status=503
            )

        ChatMessage.objects.create(
            document=document,
            question=question,
            answer=answer
        )

        return Response({
            'question': question,
            'answer': answer,
            'sources': chunks
        })


class ListDocumentsView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(
            user=self.request.user
        ).order_by('-uploaded_at')