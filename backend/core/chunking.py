import re


def chunk_text(text, chunk_size=1000, overlap=200):
    """
    Split document text into overlapping chunks while preserving
    the page number associated with each chunk.

    Expected page markers:
        [PAGE 1]
        [PAGE 2]
        [PAGE 3]

    Returns:
        list[dict]: Each chunk contains:
            {
                "text": "...",
                "page": 1
            }
    """

    if not text or not text.strip():
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0.")

    if overlap < 0:
        raise ValueError("overlap cannot be negative.")

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size.")

    # Normalize line endings.
    text = text.replace("\r\n", "\n").replace("\r", "\n").strip()

    # Find page sections created by text_extraction.py.
    page_pattern = re.compile(
        r"\[PAGE\s+(\d+)\]\s*\n?(.*?)(?=\[PAGE\s+\d+\]|\Z)",
        re.DOTALL
    )

    page_matches = page_pattern.findall(text)

    # If no page markers exist, treat the entire document as page 1.
    if not page_matches:
        page_matches = [("1", text)]

    chunks = []

    for page_number, page_text in page_matches:

        page_number = int(page_number)
        page_text = page_text.strip()

        if not page_text:
            continue

        # Split page text into paragraphs.
        paragraphs = [
            paragraph.strip()
            for paragraph in page_text.split("\n\n")
            if paragraph.strip()
        ]

        current_chunk = ""

        for paragraph in paragraphs:

            # Handle paragraphs larger than the chunk size.
            if len(paragraph) > chunk_size:

                if current_chunk:
                    chunks.append({
                        "text": current_chunk.strip(),
                        "page": page_number
                    })
                    current_chunk = ""

                start = 0

                while start < len(paragraph):
                    end = start + chunk_size

                    chunks.append({
                        "text": paragraph[start:end].strip(),
                        "page": page_number
                    })

                    if end >= len(paragraph):
                        break

                    start = end - overlap

                continue

            # Start a new chunk.
            if not current_chunk:
                current_chunk = paragraph
                continue

            # Try to add the next paragraph.
            combined = current_chunk + "\n\n" + paragraph

            if len(combined) <= chunk_size:
                current_chunk = combined

            else:
                # Save the current chunk.
                chunks.append({
                    "text": current_chunk.strip(),
                    "page": page_number
                })

                # Preserve overlap for retrieval context.
                overlap_text = (
                    current_chunk[-overlap:]
                    if overlap > 0
                    else ""
                )

                if overlap_text:
                    current_chunk = (
                        overlap_text + "\n\n" + paragraph
                    )
                else:
                    current_chunk = paragraph

                # Safely split if overlap + paragraph is too large.
                while len(current_chunk) > chunk_size:

                    chunks.append({
                        "text": current_chunk[:chunk_size].strip(),
                        "page": page_number
                    })

                    if overlap > 0:
                        current_chunk = current_chunk[
                            chunk_size - overlap:
                        ]
                    else:
                        current_chunk = current_chunk[chunk_size:]

        # Save remaining text from this page.
        if current_chunk.strip():
            chunks.append({
                "text": current_chunk.strip(),
                "page": page_number
            })

    return chunks