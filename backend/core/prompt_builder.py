def build_prompt(question, chunks, chat_history=None):
    """
    Build a grounded RAG prompt using retrieved document chunks
    and optional conversation history.
    """

    # Build the document context.
    # Each retrieved chunk is clearly separated so the LLM
    # can distinguish between different pieces of evidence.
    context_parts = []

    for i, chunk in enumerate(chunks, start=1):
        context_parts.append(
            f"--- Retrieved Source {i} ---\n"
            f"{chunk}\n"
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

8. Keep the answer clear and directly relevant to the user's question.

Answer:"""

    return prompt