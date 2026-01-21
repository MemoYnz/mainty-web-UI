import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithEmail, me, loading } = useAuth();

  const [email, setEmail] = useState(localStorage.getItem('lastEmail') || 'engineer1@mainty.local');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');

  const roleName = me?.role?.name ?? me?.role ?? '';

  const handleLogin = async () => {
    setError('');
    try {
      localStorage.setItem('lastEmail', email);
      await loginWithEmail(email, password);
      navigate('/');
    } catch {
      setError('Login failed');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16, maxWidth: 420 }}>
      <h1>Login</h1>

      <div style={{ display: 'grid', gap: 10 }}>
        <label>
          Email:
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="engineer1@mainty.local"
          />
        </label>

        <label>
          Password:
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="1234"
          />
        </label>

        <button onClick={handleLogin} disabled={loading} style={{ padding: 10 }}>
          Login
        </button>

        {error && <div style={{ color: 'red' }}>{error}</div>}

        {me && (
          <div style={{ marginTop: 8 }}>
            Current: <strong>{me.fullName}</strong> ({roleName})
          </div>
        )}
      </div>
    </div>
  );
}



//19.01.26
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../auth/AuthContext';

// export default function Login() {
//   const navigate = useNavigate();
//   const { setUserId, me, loading } = useAuth();
//   const [userIdInput, setUserIdInput] = useState(localStorage.getItem('userId') || '1');
//   const [error, setError] = useState('');

//   const handleLogin = async () => {
//     setError('');
//     try {
//       await setUserId(userIdInput);
//       navigate('/');
//     } catch {
//       setError('Login failed');
//     }
//   };

//   return (
//     <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
//       <h1>Login (Temporary)</h1>

//       <label>
//         X-UserId:&nbsp;
//         <input
//           value={userIdInput}
//           onChange={(e) => setUserIdInput(e.target.value)}
//           style={{ width: 120 }}
//         />
//       </label>

//       <button onClick={handleLogin} style={{ marginLeft: 8 }} disabled={loading}>
//         Login
//       </button>

//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       {me && (
//         <p style={{ marginTop: 12 }}>
//           Current: <strong>{me.fullName}</strong> ({me.role})
//         </p>
//       )}
//     </div>
//   );
// }
