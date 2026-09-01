def chunk_text(text, chunk_size=1000, overlap=200):
    """
    Split document text into meaningful overlapping chunks.

    The function tries to preserve paragraph boundaries while
    maintaining a consistent maximum chunk size.

    Returns:
        list[str]: A list of text chunks.
    """

    if not text or not text.strip():
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0.")

    if overlap < 0:
        raise ValueError("overlap cannot be negative.")

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size.")

    text = text.replace("\r\n", "\n").replace("\r", "\n").strip()

    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n\n")
        if paragraph.strip()
    ]

    chunks = []
    current_chunk = ""

    for paragraph in paragraphs:

        if len(paragraph) > chunk_size:

            if current_chunk:
                chunks.append(current_chunk)
                current_chunk = ""

            start = 0

            while start < len(paragraph):
                end = start + chunk_size
                chunks.append(paragraph[start:end])

                if end >= len(paragraph):
                    break

                start = end - overlap

            continue

        if not current_chunk:
            current_chunk = paragraph
            continue

        combined = current_chunk + "\n\n" + paragraph

        if len(combined) <= chunk_size:
            current_chunk = combined

        else:
            chunks.append(current_chunk)

            overlap_text = (
                current_chunk[-overlap:]
                if overlap > 0
                else ""
            )

            if overlap_text:
                current_chunk = overlap_text + "\n\n" + paragraph
            else:
                current_chunk = paragraph


            while len(current_chunk) > chunk_size:

                chunks.append(current_chunk[:chunk_size])

                if overlap > 0:
                    current_chunk = current_chunk[
                        chunk_size - overlap:
                    ]
                else:
                    current_chunk = current_chunk[chunk_size:]

   
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks