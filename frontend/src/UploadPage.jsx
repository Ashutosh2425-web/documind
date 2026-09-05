import { useState, useEffect } from 'react';

function UploadPage({ token, onDocumentSelect }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        'http://127.0.0.1:8000/api/documents/',
        {
          headers: {
            'Authorization': `Token ${token}`,
          },
        }
      );

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
      const res = await fetch(
        'http://127.0.0.1:8000/api/upload/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data)
            ? data[0]
            : data.detail || 'Upload failed'
        );
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

    if (file) {
      handleUpload(file);
    }

    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div style={styles.page}>

      {/* Header */}
      <header style={styles.header}>

        <div style={styles.logoSection}>

          {/* PDF Logo */}
          <div style={styles.logoIcon}>
            <span style={styles.pdfLogo}>PDF</span>
          </div>

          <div>
            <div style={styles.logoText}>
              DocuMind
            </div>

            <div style={styles.logoSubtitle}>
              Intelligent document assistant
            </div>
          </div>

        </div>

        <div style={styles.headerRight}>

          <div style={styles.userBadge}>
            <div style={styles.userAvatar}>
              U
            </div>

            <span>
              User
            </span>
          </div>

          <button style={styles.logoutButton}>
            Logout
          </button>

        </div>

      </header>


      {/* Main Layout */}
      <div style={styles.layout}>

        {/* Left Sidebar */}
        <aside style={styles.sidebar}>

          <div style={styles.sidebarHeader}>

            <div>

              <h2 style={styles.sidebarTitle}>
                Documents
              </h2>

              <p style={styles.documentCount}>
                {documents.length}{' '}
                {documents.length === 1
                  ? 'document'
                  : 'documents'}
              </p>

            </div>

            <div style={styles.documentIcon}>
              📄
            </div>

          </div>


          {/* Upload Button */}
          <label style={styles.sidebarUploadButton}>

            <span style={styles.plusIcon}>
              +
            </span>

            <span>
              Upload document
            </span>

            <input
              type="file"
              onChange={handleFileInput}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.txt"
            />

          </label>


          {/* Document List */}
          <div style={styles.documentList}>

            {documents.length === 0 ? (

              <div style={styles.emptyDocuments}>

                <div style={styles.emptyIcon}>
                  📂
                </div>

                <p style={styles.emptyTitle}>
                  No documents yet
                </p>

                <p style={styles.emptyText}>
                  Upload your first document to get started.
                </p>

              </div>

            ) : (

              documents.map((doc) => (

                <div
                  key={doc.id}
                  onClick={() => onDocumentSelect(doc)}
                  style={styles.documentItem}

                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      '#fff4ee';

                    e.currentTarget.style.borderColor =
                      '#ffd5c5';
                  }}

                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      '#ffffff';

                    e.currentTarget.style.borderColor =
                      '#eee5df';
                  }}
                >

                  <div style={styles.fileIcon}>

                    {doc.original_filename
                      ?.toLowerCase()
                      .endsWith('.pdf')
                      ? 'PDF'
                      : 'DOC'}

                  </div>


                  <div style={styles.documentInfo}>

                    <div style={styles.documentName}>
                      {doc.original_filename}
                    </div>

                    <div style={styles.documentDate}>

                      {new Date(
                        doc.uploaded_at
                      ).toLocaleDateString()}

                    </div>

                  </div>


                  <div style={styles.arrow}>
                    ›
                  </div>

                </div>

              ))

            )}

          </div>


          {/* Sidebar Footer */}
          <div style={styles.sidebarFooter}>

            <div style={styles.supportText}>
              Supported files
            </div>

            <div style={styles.fileTypes}>
              PDF · DOCX · TXT
            </div>

          </div>

        </aside>


        {/* Main Content */}
        <main style={styles.content}>

          <div style={styles.contentInner}>

            <div style={styles.welcomeSection}>

              <div style={styles.welcomeBadge}>

                <span>
                  ✦
                </span>

                Document workspace

              </div>


              <h1 style={styles.heading}>

                What would you like to

                <span style={styles.headingAccent}>
                  {' '}explore?
                </span>

              </h1>


              <p style={styles.description}>

                Upload a document and let DocuMind help you
                understand, analyze, and find information
                from it.

              </p>

            </div>


            {/* Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}

              onDragLeave={() => {
                setDragActive(false);
              }}

              onDrop={handleDrop}

              style={{
                ...styles.uploadCard,
                ...(dragActive
                  ? styles.uploadCardActive
                  : {}),
              }}
            >

              {uploading ? (

                <div style={styles.uploadContent}>

                  <div style={styles.loadingCircle}>
                    ⟳
                  </div>

                  <h2 style={styles.uploadTitle}>
                    Processing your document
                  </h2>

                  <p style={styles.uploadDescription}>
                    Uploading and preparing your document...
                    this may take a moment.
                  </p>

                </div>

              ) : (

                <div style={styles.uploadContent}>

                  <div style={styles.uploadIconWrapper}>

                    <div style={styles.uploadIcon}>
                      ↑
                    </div>

                  </div>


                  <h2 style={styles.uploadTitle}>
                    Drop your document here
                  </h2>


                  <p style={styles.uploadDescription}>
                    Drag and drop your PDF, DOCX, or TXT file
                    here
                  </p>


                  <div style={styles.orText}>
                    or
                  </div>


                  <label style={styles.browseButton}>

                    Browse files

                    <input
                      type="file"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                      accept=".pdf,.docx,.txt"
                    />

                  </label>


                  <p style={styles.fileHint}>
                    PDF, DOCX and TXT files supported
                  </p>

                </div>

              )}

            </div>


            {/* Error */}
            {error && (

              <div style={styles.errorBox}>

                <span style={styles.errorIcon}>
                  !
                </span>

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* Information Cards */}
            <div style={styles.infoGrid}>

              <div style={styles.infoCard}>

                <div style={styles.infoIcon}>
                  🔍
                </div>

                <div>

                  <h3 style={styles.infoTitle}>
                    Ask questions
                  </h3>

                  <p style={styles.infoText}>
                    Find answers directly from your documents.
                  </p>

                </div>

              </div>


              <div style={styles.infoCard}>

                <div style={styles.infoIcon}>
                  ⚡
                </div>

                <div>

                  <h3 style={styles.infoTitle}>
                    Fast retrieval
                  </h3>

                  <p style={styles.infoText}>
                    Quickly find the most relevant information.
                  </p>

                </div>

              </div>


              <div style={styles.infoCard}>

                <div style={styles.infoIcon}>
                  📑
                </div>

                <div>

                  <h3 style={styles.infoTitle}>
                    Source aware
                  </h3>

                  <p style={styles.infoText}>
                    See where answers were found in your document.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}


const styles = {

  page: {
    minHeight: '100vh',
    background: '#fffaf7',
    color: '#292524',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },


  header: {
    height: '72px',
    background: '#ffffff',
    borderBottom: '1px solid #eee5df',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    boxSizing: 'border-box',
  },


  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },


  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: '#ff8066',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    boxShadow:
      '0 3px 8px rgba(255, 128, 102, 0.18)',
  },


  pdfLogo: {
    fontSize: '10px',
    letterSpacing: '0.5px',
    border: '1.5px solid #ffffff',
    borderRadius: '3px',
    padding: '5px 3px',
    lineHeight: 1,
  },


  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#292524',
  },


  logoSubtitle: {
    fontSize: '11px',
    color: '#9a8f89',
    marginTop: '1px',
  },


  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },


  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#57504b',
    fontSize: '14px',
    fontWeight: '500',
  },


  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#fff0e9',
    color: '#ff8066',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },


  logoutButton: {
    border: 'none',
    background: 'transparent',
    color: '#8c817b',
    cursor: 'pointer',
    fontSize: '14px',
  },


  layout: {
    display: 'flex',
    minHeight: 'calc(100vh - 72px)',
  },


  sidebar: {
    width: '290px',
    flexShrink: 0,
    background: '#ffffff',
    borderRight: '1px solid #eee5df',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },


  sidebarHeader: {
    padding: '25px 22px 17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  sidebarTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#302b28',
  },


  documentCount: {
    margin: '5px 0 0',
    fontSize: '12px',
    color: '#a0958e',
  },


  documentIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: '#fff4ee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '17px',
  },


  sidebarUploadButton: {
    margin: '0 18px 15px',
    height: '43px',
    borderRadius: '9px',
    background: '#ff8066',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow:
      '0 4px 12px rgba(255, 128, 102, 0.18)',
  },


  plusIcon: {
    fontSize: '19px',
    lineHeight: 1,
  },


  documentList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 12px',
  },


  documentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '11px 9px',
    border: '1px solid #eee5df',
    borderRadius: '9px',
    marginBottom: '8px',
    cursor: 'pointer',
    background: '#ffffff',
    transition: 'all 0.15s ease',
  },


  fileIcon: {
    width: '34px',
    height: '38px',
    borderRadius: '7px',
    background: '#fff0e9',
    color: '#ed7358',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    fontWeight: '800',
    flexShrink: 0,
  },


  documentInfo: {
    minWidth: 0,
    flex: 1,
  },


  documentName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#413a36',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },


  documentDate: {
    fontSize: '10px',
    color: '#a0958e',
    marginTop: '4px',
  },


  arrow: {
    color: '#b5aaa4',
    fontSize: '21px',
    flexShrink: 0,
  },


  emptyDocuments: {
    padding: '35px 18px',
    textAlign: 'center',
  },


  emptyIcon: {
    fontSize: '30px',
    marginBottom: '10px',
    opacity: 0.7,
  },


  emptyTitle: {
    margin: '0 0 5px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#625a55',
  },


  emptyText: {
    margin: 0,
    fontSize: '11px',
    lineHeight: 1.5,
    color: '#a0958e',
  },


  sidebarFooter: {
    padding: '16px 20px 20px',
    borderTop: '1px solid #eee5df',
  },


  supportText: {
    fontSize: '10px',
    color: '#a0958e',
    marginBottom: '4px',
  },


  fileTypes: {
    fontSize: '10px',
    color: '#756b65',
    fontWeight: '600',
  },


  content: {
    flex: 1,
    overflowY: 'auto',
    boxSizing: 'border-box',
  },


  contentInner: {
    maxWidth: '920px',
    margin: '0 auto',
    padding: '70px 45px 50px',
  },


  welcomeSection: {
    textAlign: 'center',
    marginBottom: '36px',
  },


  welcomeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 12px',
    borderRadius: '20px',
    background: '#fff0e9',
    color: '#ed7358',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '17px',
  },


  heading: {
    margin: 0,
    fontSize: '38px',
    lineHeight: 1.15,
    fontWeight: '750',
    letterSpacing: '-1px',
    color: '#302b28',
  },


  headingAccent: {
    color: '#ff8066',
  },


  description: {
    maxWidth: '590px',
    margin: '15px auto 0',
    color: '#8d827c',
    fontSize: '15px',
    lineHeight: 1.6,
  },


  uploadCard: {
    border: '2px dashed #e7d9d1',
    borderRadius: '18px',
    background: '#ffffff',
    minHeight: '330px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },


  uploadCardActive: {
    border: '2px dashed #ff8066',
    background: '#fff5f0',
    transform: 'scale(1.005)',
  },


  uploadContent: {
    textAlign: 'center',
    padding: '35px 20px',
  },


  uploadIconWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    background: '#fff0e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px',
  },


  uploadIcon: {
    fontSize: '32px',
    color: '#ff8066',
    fontWeight: '700',
  },


  loadingCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#fff0e9',
    color: '#ff8066',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    margin: '0 auto 18px',
  },


  uploadTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#39322e',
  },


  uploadDescription: {
    margin: '9px 0 0',
    color: '#958a83',
    fontSize: '13px',
  },


  orText: {
    margin: '17px 0',
    color: '#b0a59f',
    fontSize: '12px',
  },


  browseButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '11px 24px',
    borderRadius: '9px',
    background: '#ff8066',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow:
      '0 4px 12px rgba(255, 128, 102, 0.18)',
  },


  fileHint: {
    margin: '13px 0 0',
    color: '#b0a59f',
    fontSize: '10px',
  },


  errorBox: {
    marginTop: '18px',
    padding: '12px 15px',
    borderRadius: '9px',
    background: '#fff1ef',
    border: '1px solid #ffd4ce',
    color: '#c0392b',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    fontSize: '12px',
  },


  errorIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#e74c3c',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
  },


  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '13px',
    marginTop: '22px',
  },


  infoCard: {
    background: '#ffffff',
    border: '1px solid #eee5df',
    borderRadius: '12px',
    padding: '17px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },


  infoIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: '#fff5ef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },


  infoTitle: {
    margin: '1px 0 5px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#4a423e',
  },


  infoText: {
    margin: 0,
    fontSize: '10px',
    lineHeight: 1.5,
    color: '#9b9089',
  },

};


export default UploadPage;