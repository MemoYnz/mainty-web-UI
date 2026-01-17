import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireRole({ allow, children }) {
  const { me, loading } = useAuth();

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!me) return <Navigate to="/login" replace />;

  const ok = Array.isArray(allow) && allow.includes(me.role);
  if (!ok) return <Navigate to="/" replace />;

  return children;
}
