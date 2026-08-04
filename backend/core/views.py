from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer

from rest_framework import generics
from rest_framework.parsers import MultiPartParser
from .models import Document
from .serializers import DocumentSerializer

from .text_extraction import extract_text
from .chunking import chunk_text
# Create your views here.
def hello_api(request):
    return JsonResponse({"message": "Hello from Django!"})
class UploadDocumentView(APIView):
    parser_classes = [MultiPartParser]
    serializer_class = DocumentSerializer

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=400)

        document = Document.objects.create(
            file=file_obj,
            original_filename=file_obj.name
        )
        serializer = DocumentSerializer(document)
        return Response(serializer.data, status=201)

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
        print(f"Created {len(chunks)} chunks for {document.original_filename}")
        for i, chunk in enumerate(chunks[:2]): 
            print(f"--- Chunk {i} ---")
            print(chunk[:200]) 
