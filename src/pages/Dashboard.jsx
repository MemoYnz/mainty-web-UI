import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMe, getDashboardWorkOrders } from '../api/endpoints';

export default function Dashboard() {
  const [me, setMe] = useState(null);

  const [myOpen, setMyOpen] = useState([]);
  const [unassignedNew, setUnassignedNew] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setErr('');

      try {
        const meRes = await getMe();
        if (!isMounted) return;

        setMe(meRes.data);

        // Engineer dashboard only
        if (meRes.data?.role === 'Engineer') {
          const dashRes = await getDashboardWorkOrders(meRes.data.userId, 10);
          if (!isMounted) return;

          setMyOpen(dashRes.data?.myOpen || []);
          setUnassignedNew(dashRes.data?.unassignedNew || []);
        }
      } catch {
        if (isMounted) setErr('Failed to load dashboard data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div>Loading Dashboard...</div>;
  if (err) return <div style={{ color: 'red' }}>{err}</div>;

  const isEngineer = me?.role === 'Engineer';

  return (
    <div>
      <h1>Dashboard</h1>

      {isEngineer ? (
        <div style={{ display: 'grid', gap: 16, maxWidth: 1000 }}>
          {/* Section 1: My Open Breakdowns */}
          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>My Open Breakdowns</h3>
              <Link to="/workorders" style={{ fontSize: 14 }}>Go to Breakdowns</Link>
            </div>

            {myOpen.length === 0 ? (
              <p style={{ marginTop: 10 }}>No open breakdowns assigned to you.</p>
            ) : (
              <div style={{ marginTop: 10 }}>
                {myOpen.map(x => (
                  <div
                    key={x.workOrderId}
                    style={{
                      border: '1px solid #ddd',
                      padding: 10,
                      marginBottom: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>Breakdown #{x.workOrderId}</div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        Status: {x.status} • Priority: {x.priority} • Unit: {x.unitId} • Area: {x.areaId}
                      </div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        Created: {new Date(x.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Link to={`/workorders/${x.workOrderId}`}>Open</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Unassigned New */}
          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Unassigned New</h3>
              <Link to="/workorders" style={{ fontSize: 14 }}>Go to Breakdowns</Link>
            </div>

            {unassignedNew.length === 0 ? (
              <p style={{ marginTop: 10 }}>No unassigned new breakdowns.</p>
            ) : (
              <div style={{ marginTop: 10 }}>
                {unassignedNew.map(x => (
                  <div
                    key={x.workOrderId}
                    style={{
                      border: '1px solid #ddd',
                      padding: 10,
                      marginBottom: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>Breakdown #{x.workOrderId}</div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        Status: {x.status} • Priority: {x.priority} • Unit: {x.unitId} • Area: {x.areaId}
                      </div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        Created: {new Date(x.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Link to={`/workorders/${x.workOrderId}`}>Open</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placeholder sections (както договорихме MVP) */}
          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>My Shift Tasks (Today)</h3>
            <div style={{ fontSize: 14, color: '#555' }}>(MVP next)</div>
            <div style={{ marginTop: 8 }}>
              <Link to="/shifttasks">Go to ShiftTasks</Link>
            </div>
          </div>

          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>PPM Plans</h3>
            <div style={{ fontSize: 14, color: '#555' }}>(MVP next)</div>
            <div style={{ marginTop: 8 }}>
              <Link to="/ppm">Go to PPM</Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ color: '#555' }}>
          Dashboard view for this role will be added later.
        </div>
      )}
    </div>
  );
}
