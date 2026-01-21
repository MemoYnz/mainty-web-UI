import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react';
import { getMe, login } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMe();
      setMe(res.data);
    } catch {
      setMe(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshMe();
    } else {
      setLoading(false);
    }
  }, [refreshMe]);

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const safeEmail = String(email || '').trim();
      const safePassword = String(password || '');

      const res = await login(safeEmail, safePassword);

      // backend returns { userId, fullName, role, token, expiresInMinutes }
      localStorage.setItem('accessToken', String(res.data.token || ''));

      await refreshMe();
    } catch (e) {
      setMe(null);
      localStorage.removeItem('accessToken');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setMe(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        me,
        loading,
        refreshMe,
        loginWithEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}





// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { getMe } from '../api/endpoints';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [me, setMe] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const refreshMe = async () => {
//     setLoading(true);
//     try {
//       const res = await getMe();
//       setMe(res.data);
//     } catch {
//       setMe(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // if userId is already set in localStorage, try load user on app start
//     const userId = localStorage.getItem('userId');
//     if (userId) {
//       refreshMe();
//     } else {
//       setLoading(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const setUserId = async (userId) => {
//     localStorage.setItem('userId', userId);
//     await refreshMe();
//   };

//   const logout = () => {
//     localStorage.removeItem('userId');
//     setMe(null);
//   };

//   return (
//     <AuthContext.Provider value={{ me, loading, refreshMe, setUserId, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
//   return ctx;
// }
