import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_embeddings(chunks):
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=chunks
    )
    return [e.values for e in result.embeddings]