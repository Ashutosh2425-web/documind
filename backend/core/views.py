from django.http import JsonResponse
from rest_framework import generics
from rest_framework.parsers import MultiPartParser
from .models import Document
from .serializers import DocumentSerializer
from .text_extraction import extract_text
from .chunking import chunk_text
from .embeddings import generate_embeddings
from .vectorstore import add_chunks_to_store


def hello_api(request):
    return JsonResponse({"message": "Hello from Django!"})


class UploadDocumentView(generics.CreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser]

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        document = serializer.save(original_filename=file_obj.name)

        extracted = extract_text(document.file.path)
        document.extracted_text = extracted
        document.save()

        chunks = chunk_text(extracted)
        embeddings = generate_embeddings(chunks)

        add_chunks_to_store(document.id, chunks, embeddings)

        print(f"Stored {len(chunks)} chunks in vector DB for {document.original_filename}")
