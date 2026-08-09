import { useState } from 'react';

function AuthPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isSignup ? '/api/signup/' : '/api/login/';

    try {
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Save token so we stay logged in
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);

      onLogin(data.token, data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', fontFamily: 'sans-serif' }}>
      <h1>DocuMind</h1>
      <h2>{isSignup ? 'Create an account' : 'Log in'}</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        {error && <p style={{ color: '#c0392b' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.6rem' }}>
          {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span
          onClick={() => setIsSignup(!isSignup)}
          style={{ color: '#4a90d9', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSignup ? 'Log in' : 'Sign up'}
        </span>
      </p>
    </div>
  );
}

export default AuthPage;