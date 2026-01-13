import React, { useState } from 'react';
import { useAuth } from './auth/AuthContext';

export default function AuthPanel() {
  const [userIdInput, setUserIdInput] = useState(localStorage.getItem('userId') || '1');
  const { me, loading, setUserId, logout } = useAuth();

  const handleLoad = async () => {
    await setUserId(userIdInput);
  };

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h2>Mainty – Temporary Login</h2>

      <label>
        X-UserId:&nbsp;
        <input
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          style={{ width: 120 }}
        />
      </label>

      <button onClick={handleLoad} style={{ marginLeft: 8 }} disabled={loading}>
        Load Me
      </button>

      <button onClick={logout} style={{ marginLeft: 8 }} disabled={loading}>
        Logout
      </button>

      {loading && <p>Loading...</p>}

      {me && (
        <pre style={{ marginTop: 16, background: '#f5f5f5', padding: 12 }}>
          {JSON.stringify(me, null, 2)}
        </pre>
      )}

      {!loading && !me && <p style={{ marginTop: 16 }}>No user loaded.</p>}
    </div>
  );
}
