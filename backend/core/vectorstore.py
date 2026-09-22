import chromadb


_chroma_client = None
_collection = None


def get_collection():
    """
    Create the ChromaDB client and collection only when needed.

    This lazy initialization prevents Django from starting ChromaDB
    during application startup, which is important for serverless
    environments such as Vercel.
    """

    global _chroma_client
    global _collection

    if _collection is None:

        _chroma_client = chromadb.PersistentClient(
            path="./chroma_db"
        )

        _collection = _chroma_client.get_or_create_collection(
            name="documind_chunks"
        )

    return _collection


def add_chunks_to_store(document_id, chunks, embeddings):
    """
    Store page-aware document chunks in ChromaDB.

    Each chunk has the format:
        {
            "text": "...",
            "page": 1
        }
    """

    collection = get_collection()

    ids = [
        f"doc{document_id}_chunk{i}"
        for i in range(len(chunks))
    ]

    documents = [
        chunk["text"]
        for chunk in chunks
    ]

    metadatas = [
        {
            "document_id": document_id,
            "chunk_index": i,
            "page": chunk["page"]
        }
        for i, chunk in enumerate(chunks)
    ]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )


def query_store(document_id, query_embedding, top_k=3):
    """
    Search only inside the selected document.

    Returns the most relevant text chunks together with
    their metadata, including page numbers.
    """

    collection = get_collection()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={
            "document_id": document_id
        }
    )

    return results