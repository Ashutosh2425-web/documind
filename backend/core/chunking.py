def chunk_text(text, chunk_size=1000, overlap=200):
    """
    Split document text into overlapping chunks while trying to
    preserve paragraph boundaries.

    The function still returns a list of strings so it remains
    compatible with the existing embedding and vector-store pipeline.
    """

    if not text or not text.strip():
        return []

    
    text = text.replace("\r\n", "\n").replace("\r", "\n").strip()

    # Split the document into paragraphs.
    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n\n")
        if paragraph.strip()
    ]

    chunks = []
    current_chunk = ""

    for paragraph in paragraphs:

        if not current_chunk:
            current_chunk = paragraph

        elif len(current_chunk) + len(paragraph) + 2 <= chunk_size:
            current_chunk += "\n\n" + paragraph

        else:
           
            chunks.append(current_chunk)

           
            overlap_text = current_chunk[-overlap:] if overlap > 0 else ""

            current_chunk = (
                overlap_text + "\n\n" + paragraph
                if overlap_text
                else paragraph
            )

            
            while len(current_chunk) > chunk_size:
                chunks.append(current_chunk[:chunk_size])

                current_chunk = current_chunk[
                    max(0, chunk_size - overlap):
                ]

    if current_chunk:
        chunks.append(current_chunk)

    return chunks