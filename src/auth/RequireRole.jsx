// src/auth/RequireRole.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireRole({ roles, children }) {
  const { me, loading } = useAuth();

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!me) return <Navigate to="/login" replace />;

  const roleName = me?.role?.name ?? me?.role ?? '';
  const allowed = Array.isArray(roles) && roles.includes(roleName);

  if (!allowed) return <Navigate to="/" replace />;

  return children;
}


// import { Navigate } from 'react-router-dom';
// import { useAuth } from './AuthContext';

// export default function RequireRole({ roles, children }) {
//   const { me, loading } = useAuth();

//   if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
//   if (!me) return <Navigate to="/login" replace />;

//   const role = me?.role || '';
//   const allowed = Array.isArray(roles) && roles.includes(role);

//   if (!allowed) return <Navigate to="/" replace />;

//   return children;
// }





//17/01/26 22:35
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from './AuthContext';

// export default function RequireRole({ allow, children }) {
//   const { me, loading } = useAuth();

//   if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
//   if (!me) return <Navigate to="/login" replace />;

//   const ok = Array.isArray(allow) && allow.includes(me.role);
//   if (!ok) return <Navigate to="/" replace />;

//   return children;
// }
