def build_prompt(question, chunks, chat_history=None):
    context = "\n\n".join([f"[Chunk {i+1}]: {chunk}" for i, chunk in enumerate(chunks)])

    history_text = ""
    if chat_history:
        history_text = "\n\nPrevious conversation:\n"
        for msg in chat_history:
            history_text += f"Q: {msg.question}\nA: {msg.answer}\n"

    prompt = f"""You are answering questions based strictly on the provided document context.

Context:
{context}
{history_text}

Question: {question}

Instructions:
- Answer ONLY using the information in the context above. Do not use outside knowledge.
- If the answer is found, mention which chunk number supports it (e.g., "According to Chunk 2...").
- If the answer is not found in the context, respond exactly with: "I don't know based on the provided document."

Answer:"""

    return prompt