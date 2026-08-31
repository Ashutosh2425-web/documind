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
      {/* HEADER */}
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
                Document context enabled
              </div>
            </div>
          </div>
        </div>

        {/* BRAND */}
        <div style={styles.brand}>
          <div style={styles.logo}>
            <span style={styles.logoPaper}>▤</span>
            <span style={styles.logoSpark}>✦</span>
          </div>

          <span>DocuMind</span>
        </div>
      </header>

      {/* MAIN CHAT */}
      <main style={styles.chatArea}>
        <div style={styles.messagesContainer}>

          {/* EMPTY STATE */}
          {messages.length === 0 && !loading && (
            <div style={styles.emptyState}>

              <div style={styles.emptyLogo}>
                <div style={styles.emptyLogoPaper}>▤</div>
                <div style={styles.emptyLogoSpark}>✦</div>
              </div>

              <div style={styles.eyebrow}>
                DOCUMENT INTELLIGENCE
              </div>

              <h1 style={styles.emptyTitle}>
                Ask anything about
                <br />
                <span style={styles.titleAccent}>your document</span>
              </h1>

              <p style={styles.emptyText}>
                Ask questions, summarize content, or explore information
                directly from your uploaded document.
              </p>

              <div style={styles.suggestionRow}>
                <button
                  style={styles.suggestion}
                  onClick={() =>
                    setQuestion('What is this document about?')
                  }
                >
                  <span style={styles.suggestionIcon}>⌕</span>
                  What is this document about?
                </button>

                <button
                  style={styles.suggestion}
                  onClick={() =>
                    setQuestion('Summarize the main points.')
                  }
                >
                  <span style={styles.suggestionIcon}>≡</span>
                  Summarize the main points
                </button>

                <button
                  style={styles.suggestion}
                  onClick={() =>
                    setQuestion('Explain this document in simple terms.')
                  }
                >
                  <span style={styles.suggestionIcon}>✧</span>
                  Explain in simple terms
                </button>
              </div>

              <div style={styles.contextBadge}>
                <span style={styles.contextDot}>●</span>
                Answers are based on {document.original_filename}
              </div>
            </div>
          )}

          {/* MESSAGES */}
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
                <div style={styles.assistantAvatar}>
                  <span>▤</span>
                  <small>✦</small>
                </div>
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

                {/* SOURCES */}
                {msg.sources && msg.sources.length > 0 && (
                  <details style={styles.sources}>
                    <summary style={styles.sourcesSummary}>
                      <span>▤</span>
                      Sources ({msg.sources.length})
                    </summary>

                    <div style={styles.sourcesList}>
                      {msg.sources.map((src, j) => (
                        <div key={j} style={styles.sourceCard}>
                          <div style={styles.sourceHeader}>
                            <div style={styles.sourceIcon}>
                              📄
                            </div>

                            <div style={styles.sourceTitle}>
                              Source {j + 1}
                            </div>
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

          {/* LOADING */}
          {loading && (
            <div style={styles.messageRow}>
              <div style={styles.assistantAvatar}>
                <span>▤</span>
                <small>✦</small>
              </div>

              <div style={styles.typingBubble}>
                <span style={styles.dot}>●</span>
                <span style={styles.dot}>●</span>
                <span style={styles.dot}>●</span>
                <span style={styles.thinkingText}>
                  Searching your document...
                </span>
              </div>
            </div>
          )}

          {/* ERROR */}
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

        {/* INPUT */}
        <div style={styles.inputSection}>
          <div style={styles.inputBox}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your document..."
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

          <div style={styles.inputFooter}>
            <span>
              <span style={styles.footerDot}>●</span>
              Document context enabled
            </span>

            <span>
              Enter ↵ to send · Shift + Enter for a new line
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#fffaf7',
    color: '#2f2926',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },

  /* HEADER */

  header: {
    height: '72px',
    background: '#ffffff',
    borderBottom: '1px solid #f0e5df',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
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
    border: '1px solid #f0ded6',
    background: '#fff8f4',
    color: '#725c54',
    padding: '9px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  documentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },

  documentIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '11px',
    background: '#fff0e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '19px',
    flexShrink: 0,
  },

  documentName: {
    fontSize: '15px',
    fontWeight: 750,
    color: '#332b28',
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  documentSubtitle: {
    marginTop: '3px',
    fontSize: '12px',
    color: '#a48e85',
  },

  /* BRAND */

  brand: {
    fontSize: '19px',
    fontWeight: 800,
    color: '#493a35',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },

  logo: {
    position: 'relative',
    width: '31px',
    height: '31px',
    borderRadius: '9px',
    background: '#ff8066',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 14px rgba(255, 128, 102, 0.25)',
  },

  logoPaper: {
    fontSize: '17px',
    fontWeight: 800,
  },

  logoSpark: {
    position: 'absolute',
    right: '-5px',
    top: '-7px',
    color: '#f4b942',
    fontSize: '14px',
    textShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },

  /* CHAT */

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
    padding: '38px 24px 150px',
  },

  /* EMPTY STATE */

  emptyState: {
    maxWidth: '760px',
    margin: '75px auto 0',
    textAlign: 'center',
  },

  emptyLogo: {
    position: 'relative',
    width: '72px',
    height: '72px',
    borderRadius: '22px',
    background: '#fff0e9',
    color: '#ff8066',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 30px rgba(255, 128, 102, 0.12)',
  },

  emptyLogoPaper: {
    fontSize: '32px',
    fontWeight: 800,
  },

  emptyLogoSpark: {
    position: 'absolute',
    right: '8px',
    top: '5px',
    color: '#f4b942',
    fontSize: '19px',
    fontWeight: 800,
  },

  eyebrow: {
    fontSize: '11px',
    letterSpacing: '2px',
    fontWeight: 800,
    color: '#ff8066',
    marginBottom: '10px',
  },

  emptyTitle: {
    margin: 0,
    fontSize: '36px',
    lineHeight: 1.18,
    fontWeight: 800,
    color: '#302724',
    letterSpacing: '-0.8px',
  },

  titleAccent: {
    color: '#ff8066',
  },

  emptyText: {
    maxWidth: '580px',
    margin: '16px auto 0',
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#806f68',
  },

  suggestionRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '30px',
  },

  suggestion: {
    border: '1px solid #f0ded6',
    background: '#ffffff',
    color: '#675750',
    padding: '11px 15px',
    borderRadius: '13px',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 3px 12px rgba(77, 48, 38, 0.04)',
    transition: 'all 0.2s ease',
  },

  suggestionIcon: {
    color: '#ff8066',
    fontWeight: 800,
    marginRight: '7px',
  },

  contextBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    marginTop: '24px',
    padding: '8px 13px',
    borderRadius: '20px',
    background: '#fff3d9',
    color: '#806638',
    fontSize: '12px',
    fontWeight: 600,
  },

  contextDot: {
    color: '#f4b942',
    fontSize: '9px',
  },

  /* MESSAGES */

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
    background: '#ff8066',
    color: '#ffffff',
    borderBottomRightRadius: '5px',
    boxShadow: '0 5px 16px rgba(255, 128, 102, 0.18)',
  },

  assistantBubble: {
    background: '#ffffff',
    color: '#403531',
    border: '1px solid #f0e5df',
    borderBottomLeftRadius: '5px',
    boxShadow: '0 3px 15px rgba(77, 48, 38, 0.05)',
  },

  assistantAvatar: {
    position: 'relative',
    width: '34px',
    height: '34px',
    borderRadius: '11px',
    background: '#fff0e9',
    color: '#ff8066',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '16px',
    fontWeight: 800,
  },

  assistantAvatarSmall: {
    position: 'absolute',
    right: '-2px',
    top: '-4px',
  },

  /* SOURCES */

  sources: {
    width: '100%',
    marginTop: '10px',
  },

  sourcesSummary: {
    cursor: 'pointer',
    color: '#e76f51',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  sourcesList: {
    marginTop: '9px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  sourceCard: {
    background: '#fffdfb',
    border: '1px solid #f0e5df',
    borderRadius: '11px',
    padding: '11px 13px',
  },

  sourceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px',
  },

  sourceIcon: {
    fontSize: '13px',
  },

  sourceTitle: {
    fontSize: '12px',
    fontWeight: 750,
    color: '#806f68',
  },

  sourceText: {
    fontSize: '12px',
    lineHeight: 1.5,
    color: '#897770',
  },

  /* TYPING */

  typingBubble: {
    background: '#ffffff',
    border: '1px solid #f0e5df',
    borderRadius: '17px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 3px 15px rgba(77, 48, 38, 0.05)',
  },

  dot: {
    fontSize: '7px',
    color: '#f4b942',
  },

  thinkingText: {
    marginLeft: '7px',
    fontSize: '12px',
    color: '#99857c',
  },

  /* ERROR */

  errorBox: {
    margin: '0 auto 20px',
    maxWidth: '700px',
    width: '100%',
    boxSizing: 'border-box',
    background: '#fff5f2',
    border: '1px solid #ffd2c7',
    borderRadius: '12px',
    padding: '13px 16px',
  },

  errorTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#c94f38',
    marginBottom: '3px',
  },

  errorText: {
    fontSize: '13px',
    color: '#d46651',
  },

  /* INPUT */

  inputSection: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background:
      'linear-gradient(to top, #fffaf7 75%, rgba(255, 250, 247, 0))',
    padding: '30px 24px 17px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  inputBox: {
    width: '100%',
    maxWidth: '900px',
    background: '#ffffff',
    border: '1px solid #eadbd4',
    borderRadius: '19px',
    padding: '8px 9px 8px 17px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    boxSizing: 'border-box',
    boxShadow: '0 7px 28px rgba(77, 48, 38, 0.08)',
  },

  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    color: '#342c29',
    fontSize: '15px',
    lineHeight: 1.5,
    padding: '7px 0',
    fontFamily: 'inherit',
  },

  sendButton: {
    width: '41px',
    height: '41px',
    border: 'none',
    borderRadius: '13px',
    background: '#ff8066',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 13px rgba(255, 128, 102, 0.22)',
  },

  inputFooter: {
    width: '100%',
    maxWidth: '900px',
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#a8958d',
  },

  footerDot: {
    color: '#f4b942',
    fontSize: '8px',
    marginRight: '5px',
  },
};

export default ChatPage;