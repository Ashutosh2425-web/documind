def build_prompt(question, chunks, chat_history=None):
    """
    Build a grounded RAG prompt using retrieved document chunks
    and optional conversation history.

    Chunks can be either:
        - plain strings
        - dictionaries containing "text" and "page"
    """

    # Build the document context.
    # Each retrieved source is clearly separated and includes
    # its page number when available.
    context_parts = []

    for i, chunk in enumerate(chunks, start=1):

        if isinstance(chunk, dict):
            chunk_text = chunk.get("text", "")
            page = chunk.get("page")

            if page is not None:
                source_label = (
                    f"--- Retrieved Source {i} | Page {page} ---"
                )
            else:
                source_label = (
                    f"--- Retrieved Source {i} ---"
                )

        else:
            chunk_text = chunk
            source_label = (
                f"--- Retrieved Source {i} ---"
            )

        context_parts.append(
            f"{source_label}\n"
            f"{chunk_text}\n"
            f"--- End Source {i} ---"
        )

    context = "\n\n".join(context_parts)

    # Build conversation history separately from document context.
    # Conversation history helps understand follow-up questions,
    # but it is NOT considered evidence from the document.
    history_text = ""

    if chat_history:
        history_parts = []

        for msg in chat_history:
            history_parts.append(
                f"User: {msg.question}\n"
                f"Assistant: {msg.answer}"
            )

        history_text = (
            "\n\n"
            "CONVERSATION HISTORY\n"
            "The following conversation is provided only to understand "
            "follow-up questions and references. It is not document evidence.\n\n"
            + "\n\n".join(history_parts)
        )

    prompt = f"""You are DocuMind, an AI assistant that answers questions
using retrieved information from the user's document.

DOCUMENT CONTEXT
================
The following passages were retrieved from the user's document.
Treat them as the only factual source for answering the question.

Each source may include a page number. Use the page number when
referring to where information came from.

{context}

{history_text}

CURRENT QUESTION
================
{question}

INSTRUCTIONS
============
1. Answer the question using ONLY information supported by the
   DOCUMENT CONTEXT above.

2. Do not use outside knowledge, assumptions, or information that
   is not present in the retrieved document context.

3. If the document context does not contain enough information to
   answer the question, respond exactly with:
   "I don't know based on the provided document."

4. Do not invent facts, numbers, names, explanations, or conclusions.

5. If multiple retrieved sources are relevant, combine them only when
   the information is clearly supported by the document context.

6. Preserve important technical terms, names, numbers, and terminology
   from the document.

7. The conversation history may help you understand references such as
   "it", "they", or "that method", but the actual answer must still be
   supported by the DOCUMENT CONTEXT.

8. When the answer is supported by a source with a page number,
   mention the relevant page naturally when appropriate.

9. Keep the answer clear and directly relevant to the user's question.

Answer:"""

    return prompt