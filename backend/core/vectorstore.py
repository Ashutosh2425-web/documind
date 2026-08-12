import chromadb


chroma_client = chromadb.PersistentClient(path="./chroma_db")

collection = chroma_client.get_or_create_collection(name="documind_chunks")

def add_chunks_to_store(document_id, chunks, embeddings):
    ids = [f"doc{document_id}_chunk{i}" for i in range(len(chunks))]
    metadatas = [{"document_id": document_id, "chunk_index": i} for i in range(len(chunks))]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas
    )

def query_store(query_embedding, top_k=3):
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results