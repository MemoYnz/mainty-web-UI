import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function MainLayout() {
  const { me, logout } = useAuth();

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ padding: 12, borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: 12 }}>
        <strong>Mainty</strong>

        <nav style={{ display: 'flex', gap: 10 }}>
            <Link to="/">Dashboard</Link>

            <Link to="/workorders">Breakdowns</Link>

                {(me?.role === 'Engineer' || me?.role === 'EngineeringManager') && (
                    <Link to="/shifttasks">ShiftTasks</Link>
                )}

                {(me?.role === 'Engineer' || me?.role === 'EngineeringManager') && (
                    <Link to="/ppm">PPM</Link>
                )}
        </nav>


        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          {me ? (
            <>
              <span>
                {me.fullName} • <strong>{me.role}</strong> • UserId: {me.userId}
              </span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <span>No user loaded</span>
          )}
        </div>
      </header>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
