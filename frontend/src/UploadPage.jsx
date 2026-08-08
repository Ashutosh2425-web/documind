import { useState, useEffect } from 'react';

function UploadPage({ onDocumentSelect }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Load existing documents when page first opens
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/documents/');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/upload/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(Array.isArray(data) ? data[0] : data.detail || 'Upload failed');
      }

      setDocuments((prev) => [...prev, data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>DocuMind</h1>
      <p>Upload a document and ask questions about it.</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        style={{
          border: dragActive ? '2px solid #4a90d9' : '2px dashed #ccc',
          borderRadius: '8px',
          padding: '2.5rem',
          textAlign: 'center',
          backgroundColor: dragActive ? '#f0f7ff' : '#fafafa',
          transition: 'all 0.2s',
        }}
      >
        {uploading ? (
          <p>Uploading and processing... this may take a moment.</p>
        ) : (
          <>
            <p>Drag and drop a PDF, DOCX, or TXT file here</p>
            <p>or</p>
            <label style={{ cursor: 'pointer', color: '#4a90d9', textDecoration: 'underline' }}>
              Browse files
              <input
                type="file"
                onChange={handleFileInput}
                style={{ display: 'none' }}
                accept=".pdf,.docx,.txt"
              />
            </label>
          </>
        )}
      </div>

      {error && (
        <p style={{ color: '#c0392b', marginTop: '1rem' }}>Error: {error}</p>
      )}

      <h2 style={{ marginTop: '2rem' }}>Your Documents</h2>
      {documents.length === 0 ? (
        <p style={{ color: '#888' }}>No documents uploaded yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {documents.map((doc) => (
            <li
              key={doc.id}
              onClick={() => onDocumentSelect(doc)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{doc.original_filename}</span>
              <span style={{ color: '#888', fontSize: '0.9em' }}>
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UploadPage;