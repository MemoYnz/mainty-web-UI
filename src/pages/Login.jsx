import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { setUserId, me, loading } = useAuth();
  const [userIdInput, setUserIdInput] = useState(localStorage.getItem('userId') || '1');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await setUserId(userIdInput);
      navigate('/');
    } catch {
      setError('Login failed');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h1>Login (Temporary)</h1>

      <label>
        X-UserId:&nbsp;
        <input
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          style={{ width: 120 }}
        />
      </label>

      <button onClick={handleLogin} style={{ marginLeft: 8 }} disabled={loading}>
        Login
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {me && (
        <p style={{ marginTop: 12 }}>
          Current: <strong>{me.fullName}</strong> ({me.role})
        </p>
      )}
    </div>
  );
}
