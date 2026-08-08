from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'file', 'original_filename', 'uploaded_at', 'extracted_text']
        extra_kwargs = {
            'original_filename': {'required': False}
        }
