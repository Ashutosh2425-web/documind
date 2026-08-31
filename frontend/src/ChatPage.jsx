import { useState } from 'react';

function ChatPage({ token, document, onBack }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();

    setQuestion('');
    setLoading(true);
    setError(null);

    // Show the user's message immediately.
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: currentQuestion,
      },
    ]);

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
        {
          role: 'assistant',
          text: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backButton}>
            ← Documents
          </button>

          <div style={styles.documentInfo}>
            <div style={styles.documentIcon}>📄</div>

            <div>
              <div style={styles.documentName}>
                {document.original_filename}
              </div>

              <div style={styles.documentSubtitle}>
                Ask questions about this document
              </div>
            </div>
          </div>
        </div>

        <div style={styles.brand}>
          <span style={styles.brandIcon}>✦</span>
          DocuMind
        </div>
      </header>

      <main style={styles.chatArea}>
        <div style={styles.messagesContainer}>
          {messages.length === 0 && !loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>✦</div>

              <h1 style={styles.emptyTitle}>
                Ask anything about your document
              </h1>

              <p style={styles.emptyText}>
                DocuMind will search your document and give you an
                answer based on the available content.
              </p>

              <div style={styles.suggestionRow}>
                <button
                  style={styles.suggestion}
                  onClick={() =>
                    setQuestion('What is this document about?')
                  }
                >
                  What is this document about?
                </button>

                <button
                  style={styles.suggestion}
                  onClick={() =>
                    setQuestion('Summarize the main points.')
                  }
                >
                  Summarize the main points
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageRow,
                justifyContent:
                  msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={styles.assistantAvatar}>✦</div>
              )}

              <div
                style={{
                  ...styles.messageWrapper,
                  alignItems:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(msg.role === 'user'
                      ? styles.userBubble
                      : styles.assistantBubble),
                  }}
                >
                  {msg.text}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <details style={styles.sources}>
                    <summary style={styles.sourcesSummary}>
                      📚 View sources ({msg.sources.length})
                    </summary>

                    <div style={styles.sourcesList}>
                      {msg.sources.map((src, j) => (
                        <div key={j} style={styles.sourceCard}>
                          <div style={styles.sourceTitle}>
                            Source {j + 1}
                          </div>

                          <div style={styles.sourceText}>
                            {src.length > 250
                              ? `${src.slice(0, 250)}...`
                              : src}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.messageRow}>
              <div style={styles.assistantAvatar}>✦</div>

              <div style={styles.typingBubble}>
                <span style={styles.dot}>●</span>
                <span style={styles.dot}>●</span>
                <span style={styles.dot}>●</span>
              </div>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <div style={styles.errorTitle}>
                Something went wrong
              </div>

              <div style={styles.errorText}>
                {error}
              </div>
            </div>
          )}
        </div>

        <div style={styles.inputSection}>
          <div style={styles.inputBox}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something about your document..."
              rows={1}
              disabled={loading}
              style={styles.textarea}
            />

            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              style={{
                ...styles.sendButton,
                opacity:
                  loading || !question.trim() ? 0.45 : 1,
                cursor:
                  loading || !question.trim()
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              ↑
            </button>
          </div>

          <div style={styles.inputHint}>
            Press Enter to send · Shift + Enter for a new line
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    color: '#1e293b',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },

  header: {
    height: '72px',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '22px',
    minWidth: 0,
  },

  backButton: {
    border: 'none',
    background: '#f1f5f9',
    color: '#475569',
    padding: '9px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  documentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    minWidth: 0,
  },

  documentIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },

  documentName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1e293b',
    maxWidth: '380px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  documentSubtitle: {
    marginTop: '2px',
    fontSize: '12px',
    color: '#94a3b8',
  },

  brand: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },

  brandIcon: {
    color: '#6366f1',
    fontSize: '20px',
  },

  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },

  messagesContainer: {
    flex: 1,
    padding: '38px 24px 140px',
  },

  emptyState: {
    maxWidth: '680px',
    margin: '100px auto 0',
    textAlign: 'center',
  },

  emptyIcon: {
    width: '58px',
    height: '58px',
    borderRadius: '18px',
    background: '#eef2ff',
    color: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '26px',
    fontWeight: 800,
  },

  emptyTitle: {
    margin: 0,
    fontSize: '30px',
    lineHeight: 1.2,
    fontWeight: 750,
    color: '#1e293b',
  },

  emptyText: {
    maxWidth: '560px',
    margin: '14px auto 0',
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#64748b',
  },

  suggestionRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '28px',
  },

  suggestion: {
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '13px',
    cursor: 'pointer',
  },

  messageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '11px',
    marginBottom: '26px',
    width: '100%',
  },

  messageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '78%',
  },

  messageBubble: {
    padding: '13px 17px',
    borderRadius: '17px',
    fontSize: '15px',
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },

  userBubble: {
    background: '#6366f1',
    color: '#ffffff',
    borderBottomRightRadius: '5px',
  },

  assistantBubble: {
    background: '#ffffff',
    color: '#334155',
    border: '1px solid #e8edf3',
    borderBottomLeftRadius: '5px',
    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
  },

  assistantAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: '#eef2ff',
    color: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '15px',
    fontWeight: 800,
  },

  sources: {
    width: '100%',
    marginTop: '9px',
  },

  sourcesSummary: {
    cursor: 'pointer',
    color: '#6366f1',
    fontSize: '13px',
    fontWeight: 600,
  },

  sourcesList: {
    marginTop: '9px',
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },

  sourceCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '10px 12px',
  },

  sourceTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    marginBottom: '4px',
  },

  sourceText: {
    fontSize: '12px',
    lineHeight: 1.5,
    color: '#64748b',
  },

  typingBubble: {
    background: '#ffffff',
    border: '1px solid #e8edf3',
    borderRadius: '17px',
    padding: '12px 16px',
    display: 'flex',
    gap: '4px',
    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
  },

  dot: {
    fontSize: '8px',
    color: '#94a3b8',
  },

  errorBox: {
    margin: '0 auto 20px',
    maxWidth: '700px',
    width: '100%',
    boxSizing: 'border-box',
    background: '#fff7f7',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '13px 16px',
  },

  errorTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#b91c1c',
    marginBottom: '3px',
  },

  errorText: {
    fontSize: '13px',
    color: '#dc2626',
  },

  inputSection: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background:
      'linear-gradient(to top, #f8fafc 72%, rgba(248, 250, 252, 0))',
    padding: '30px 24px 18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  inputBox: {
    width: '100%',
    maxWidth: '900px',
    background: '#ffffff',
    border: '1px solid #dbe2ea',
    borderRadius: '18px',
    padding: '8px 9px 8px 16px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    boxSizing: 'border-box',
    boxShadow: '0 5px 25px rgba(15, 23, 42, 0.07)',
  },

  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    color: '#1e293b',
    fontSize: '15px',
    lineHeight: 1.5,
    padding: '7px 0',
    fontFamily: 'inherit',
  },

  sendButton: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '12px',
    background: '#6366f1',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputHint: {
    marginTop: '7px',
    fontSize: '11px',
    color: '#94a3b8',
  },
};

export default ChatPage;