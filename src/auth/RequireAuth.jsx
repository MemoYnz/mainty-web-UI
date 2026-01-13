import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireAuth({ children }) {
  const { me, loading } = useAuth();

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  if (!me) return <Navigate to="/login" replace />;

  return children;
}
