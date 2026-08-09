import { useState } from 'react';

function ChatPage({ token, document, onBack }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion('');
    setLoading(true);
    setError(null);

    // Show user's question immediately
    setMessages((prev) => [...prev, { role: 'user', text: currentQuestion }]);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/query/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          document_id: document.id,
          question: currentQuestion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAsk();
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Back to Documents
      </button>

      <h2>{document.original_filename}</h2>
      <p style={{ color: '#888' }}>Ask a question about this document.</p>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1rem',
          minHeight: '300px',
          maxHeight: '450px',
          overflowY: 'auto',
          marginBottom: '1rem',
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: '#aaa' }}>No messages yet. Ask something below.</p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user' ? '#4a90d9' : '#f0f0f0',
                color: msg.role === 'user' ? 'white' : 'black',
                maxWidth: '80%',
                textAlign: 'left',
              }}
            >
              {msg.text}
            </div>

            {msg.sources && (
              <details style={{ marginTop: '0.4rem', fontSize: '0.85em', color: '#666' }}>
                <summary style={{ cursor: 'pointer' }}>View sources ({msg.sources.length})</summary>
                {msg.sources.map((src, j) => (
                  <p key={j} style={{ background: '#fafafa', padding: '0.5rem', borderRadius: '4px' }}>
                    {src.slice(0, 200)}...
                  </p>
                ))}
              </details>
            )}
          </div>
        ))}

        {loading && <p style={{ color: '#888' }}>Thinking...</p>}
      </div>

      {error && <p style={{ color: '#c0392b' }}>Error: {error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
          disabled={loading}
        />
        <button onClick={handleAsk} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;