import { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import UploadPage from './UploadPage';
import ChatPage from './ChatPage';

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Check if user is already logged in (token saved from before)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    setSelectedDocument(null);
  };

  if (!token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div>
      <div style={{ textAlign: 'right', padding: '1rem', fontFamily: 'sans-serif' }}>
        Logged in as <strong>{username}</strong>{' '}
        <button onClick={handleLogout}>Log out</button>
      </div>

      {!selectedDocument ? (
        <UploadPage token={token} onDocumentSelect={setSelectedDocument} />
      ) : (
        <ChatPage
          token={token}
          document={selectedDocument}
          onBack={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

export default App;