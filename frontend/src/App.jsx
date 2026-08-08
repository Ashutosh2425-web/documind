import { useState } from 'react';
import UploadPage from './UploadPage';
import ChatPage from './ChatPage';

function App() {
  const [selectedDocument, setSelectedDocument] = useState(null);

  return (
    <div>
      {!selectedDocument ? (
        <UploadPage onDocumentSelect={setSelectedDocument} />
      ) : (
        <ChatPage
          document={selectedDocument}
          onBack={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

export default App;