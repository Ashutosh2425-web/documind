import { useState, useEffect } from 'react';

import AuthPage from './AuthPage';
import UploadPage from './UploadPage';
import ChatPage from './ChatPage';


function App() {

  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);


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

    return (
      <AuthPage
        onLogin={handleLogin}
      />
    );

  }


  
  return (

    <div>

      {!selectedDocument ? (

        <UploadPage
          token={token}
          onDocumentSelect={setSelectedDocument}
        />

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