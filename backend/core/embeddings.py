import os

from google import genai
from dotenv import load_dotenv


load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_embeddings(chunks):
    """
    Generate embeddings for page-aware document chunks.

    Each chunk is expected to have:
        {
            "text": "...",
            "page": 1
        }

    Returns:
        list: Embedding vectors corresponding to each chunk.
    """

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    if not texts:
        return []

    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=texts
    )

    return [
        embedding.values
        for embedding in result.embeddings
    ]