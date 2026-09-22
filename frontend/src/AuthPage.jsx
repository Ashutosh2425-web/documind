import { useState } from 'react';


function AuthPage({ onLogin }) {

  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isSignup
      ? '/api/signup/'
      : '/api/login/';

    const API_BASE_URL =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8000'
        : '';

    try {

      const res = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            password
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Something went wrong'
        );
      }

      localStorage.setItem(
        'token',
        data.token
      );

      localStorage.setItem(
        'username',
        data.username
      );

      onLogin(
        data.token,
        data.username
      );

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  const switchMode = () => {

    setIsSignup(!isSignup);
    setError(null);
    setPassword('');

  };


  return (

    <div style={styles.page}>

      {/* Decorative background */}

      <div style={styles.orangeBlob}></div>
      <div style={styles.blueBlob}></div>
      <div style={styles.purpleBlob}></div>
      <div style={styles.tealBlob}></div>


      <div style={styles.content}>

        {/* LEFT BRANDING */}

        <div style={styles.brandSection}>

          <div style={styles.brandLogo}>
            <div style={styles.pdfIcon}>
              PDF
            </div>
          </div>


          <h1 style={styles.brandTitle}>
            Docu<span style={styles.brandAccent}>Mind</span>
          </h1>


          <p style={styles.brandSubtitle}>
            Ask your documents.
            <br />
            Get intelligent answers.
          </p>


          <div style={styles.featureList}>

            <div style={styles.feature}>

              <div style={styles.featureIconOrange}>
                ✦
              </div>

              <div>
                <strong style={styles.featureTitle}>
                  AI-Powered
                </strong>

                <span style={styles.featureDescription}>
                  Intelligent document understanding
                </span>
              </div>

            </div>


            <div style={styles.feature}>

              <div style={styles.featureIconBlue}>
                🔍
              </div>

              <div>
                <strong style={styles.featureTitle}>
                  Smart Retrieval
                </strong>

                <span style={styles.featureDescription}>
                  Find the most relevant information
                </span>
              </div>

            </div>


            <div style={styles.feature}>

              <div style={styles.featureIconPurple}>
                📄
              </div>

              <div>
                <strong style={styles.featureTitle}>
                  Source-Aware
                </strong>

                <span style={styles.featureDescription}>
                  Answers with page references
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* LOGIN / SIGNUP CARD */}

        <div style={styles.card}>

          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>
            Secure workspace
          </div>


          <div style={styles.cardHeader}>

            <h2 style={styles.title}>
              {isSignup
                ? 'Create your account'
                : 'Welcome back'}
            </h2>

            <p style={styles.subtitle}>
              {isSignup
                ? 'Create an account to start exploring your documents.'
                : 'Sign in to continue to your DocuMind workspace.'}
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* USERNAME */}

            <div style={styles.fieldGroup}>

              <label style={styles.label}>
                Username
              </label>

              <div style={styles.inputWrapper}>

                <span style={styles.inputIcon}>
                  👤
                </span>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                  style={styles.input}
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div style={styles.fieldGroup}>

              <label style={styles.label}>
                Password
              </label>

              <div style={styles.inputWrapper}>

                <span style={styles.inputIcon}>
                  🔐
                </span>

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  style={styles.passwordInput}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  style={styles.eyeButton}
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>

              </div>

            </div>


            {/* ERROR */}

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


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer'
              }}
            >

              {loading
                ? 'Please wait...'
                : (
                  <>
                    {isSignup
                      ? 'Create Account'
                      : 'Sign In'}

                    <span style={styles.arrow}>
                      →
                    </span>
                  </>
                )}

            </button>

          </form>


          {/* SECURITY */}

          <div style={styles.securityBox}>

            <div style={styles.securityIcon}>
              ✓
            </div>

            <div>

              <strong style={styles.securityTitle}>
                Your workspace is secure
              </strong>

              <span style={styles.securityText}>
                Authentication protects your documents
                and conversations.
              </span>

            </div>

          </div>


          {/* SWITCH LOGIN / SIGNUP */}

          <div style={styles.switchSection}>

            <span style={styles.switchText}>
              {isSignup
                ? 'Already have an account?'
                : "Don't have an account?"}
            </span>

            <button
              type="button"
              onClick={switchMode}
              style={styles.switchButton}
            >
              {isSignup
                ? 'Sign in'
                : 'Create account'}
            </button>

          </div>

        </div>

      </div>


      {/* FOOTER */}

      <div style={styles.footer}>
        DocuMind • Intelligent Document Q&A
      </div>

    </div>

  );
}


const styles = {

  page: {
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    background:
      'linear-gradient(135deg, #fff7ed 0%, #eff6ff 45%, #faf5ff 100%)',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    boxSizing: 'border-box',
  },


  content: {
    width: '100%',
    maxWidth: '1080px',
    display: 'grid',
    gridTemplateColumns: '1fr 440px',
    gap: '80px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },


  orangeBlob: {
    position: 'absolute',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: '#fed7aa',
    top: '-220px',
    left: '-180px',
    filter: 'blur(10px)',
    opacity: 0.55,
  },


  blueBlob: {
    position: 'absolute',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background: '#bfdbfe',
    right: '-180px',
    top: '80px',
    filter: 'blur(15px)',
    opacity: 0.55,
  },


  purpleBlob: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: '#ddd6fe',
    left: '25%',
    bottom: '-220px',
    filter: 'blur(20px)',
    opacity: 0.6,
  },


  tealBlob: {
    position: 'absolute',
    width: '240px',
    height: '240px',
    borderRadius: '50%',
    background: '#99f6e4',
    right: '25%',
    bottom: '-170px',
    filter: 'blur(20px)',
    opacity: 0.5,
  },


  brandSection: {
    padding: '20px',
  },


  brandLogo: {
    width: '76px',
    height: '76px',
    borderRadius: '22px',
    background:
      'linear-gradient(135deg, #f97316, #fb923c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow:
      '0 15px 35px rgba(249, 115, 22, 0.25)',
    marginBottom: '24px',
  },


  pdfIcon: {
    background: '#ffffff',
    color: '#ea580c',
    fontWeight: '800',
    fontSize: '17px',
    padding: '9px 7px',
    borderRadius: '7px',
    letterSpacing: '-0.5px',
  },


  brandTitle: {
    margin: 0,
    fontSize: '52px',
    lineHeight: 1.05,
    fontWeight: '800',
    letterSpacing: '-2px',
    color: '#172033',
  },


  brandAccent: {
    color: '#f97316',
  },


  brandSubtitle: {
    fontSize: '21px',
    lineHeight: 1.5,
    color: '#64748b',
    marginTop: '18px',
    marginBottom: '38px',
  },


  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },


  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },


  featureIconOrange: {
    width: '43px',
    height: '43px',
    borderRadius: '13px',
    background: '#ffedd5',
    color: '#ea580c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '19px',
  },


  featureIconBlue: {
    width: '43px',
    height: '43px',
    borderRadius: '13px',
    background: '#dbeafe',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },


  featureIconPurple: {
    width: '43px',
    height: '43px',
    borderRadius: '13px',
    background: '#ede9fe',
    color: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },


  featureTitle: {
    display: 'block',
    color: '#1e293b',
    fontSize: '15px',
    marginBottom: '3px',
  },


  featureDescription: {
    display: 'block',
    color: '#64748b',
    fontSize: '13px',
  },


  card: {
    background: 'rgba(255, 255, 255, 0.96)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    borderRadius: '28px',
    padding: '38px',
    boxShadow:
      '0 25px 70px rgba(15, 23, 42, 0.12)',
    backdropFilter: 'blur(15px)',
  },


  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '7px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '22px',
  },


  badgeDot: {
    width: '7px',
    height: '7px',
    background: '#10b981',
    borderRadius: '50%',
    boxShadow:
      '0 0 0 3px #d1fae5',
  },


  cardHeader: {
    marginBottom: '28px',
  },


  title: {
    margin: 0,
    color: '#172033',
    fontSize: '30px',
    fontWeight: '750',
    letterSpacing: '-0.8px',
  },


  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.55,
    marginTop: '9px',
    marginBottom: 0,
  },


  fieldGroup: {
    marginBottom: '19px',
  },


  label: {
    display: 'block',
    color: '#334155',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '8px',
  },


  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '50px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '13px',
    boxSizing: 'border-box',
  },


  inputIcon: {
    width: '45px',
    textAlign: 'center',
    fontSize: '16px',
  },


  input: {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#172033',
    fontSize: '14px',
    padding: '0 13px 0 0',
    boxSizing: 'border-box',
  },


  passwordInput: {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#172033',
    fontSize: '14px',
    padding: 0,
    minWidth: 0,
  },


  eyeButton: {
    width: '45px',
    height: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
  },


  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: '11px',
    padding: '11px 13px',
    fontSize: '13px',
    marginBottom: '18px',
  },


  errorIcon: {
    width: '19px',
    height: '19px',
    borderRadius: '50%',
    background: '#ef4444',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '12px',
    flexShrink: 0,
  },


  submitButton: {
    width: '100%',
    height: '51px',
    border: 'none',
    borderRadius: '13px',
    background:
      'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '750',
    boxShadow:
      '0 10px 25px rgba(249, 115, 22, 0.25)',
    transition: 'all 0.2s ease',
  },


  arrow: {
    marginLeft: '9px',
    fontSize: '18px',
  },


  securityBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    background: '#f0fdfa',
    border: '1px solid #ccfbf1',
    borderRadius: '13px',
    padding: '13px',
    marginTop: '20px',
  },


  securityIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '9px',
    background: '#14b8a6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    flexShrink: 0,
  },


  securityTitle: {
    display: 'block',
    color: '#115e59',
    fontSize: '12px',
    marginBottom: '2px',
  },


  securityText: {
    display: 'block',
    color: '#0f766e',
    fontSize: '11px',
    lineHeight: 1.4,
  },


  switchSection: {
    textAlign: 'center',
    marginTop: '25px',
    paddingTop: '22px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '13px',
  },


  switchText: {
    color: '#64748b',
  },


  switchButton: {
    border: 'none',
    background: 'transparent',
    color: '#7c3aed',
    fontWeight: '750',
    cursor: 'pointer',
    fontSize: '13px',
    marginLeft: '5px',
    padding: 0,
  },


  footer: {
    position: 'absolute',
    bottom: '18px',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '11px',
    zIndex: 2,
  },

};


export default AuthPage;