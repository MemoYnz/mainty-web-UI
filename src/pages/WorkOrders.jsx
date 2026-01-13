import React, { useEffect, useState } from 'react';
import { getWorkOrders } from '../api/endpoints';
import { useNavigate } from 'react-router-dom';


export default function WorkOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getWorkOrders();
        if (isMounted) setItems(res.data || []);
      } catch (e) {
        if (isMounted) setError('Failed to load Breakdowns');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div>Loading Breakdowns...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Breakdowns</h1>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>UnitId</th>
            <th>AreaId</th>
            <th>CreatedBy</th>
            <th>CreatedAt</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="7">No breakdowns</td>
            </tr>
          ) : (
            items.map((x) => (
              <tr
                key={x.workOrderId ?? x.id}
                onClick={() => navigate(`/workorders/${x.workOrderId ?? x.id}`)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td>{x.workOrderId ?? x.id}</td>
                <td>{x.title ?? '-'}</td>
                <td>{String(x.status ?? '-')}</td>
                <td>{x.unitId ?? '-'}</td>
                <td>{x.areaId ?? '-'}</td>
                <td>{x.createdByUserId ?? '-'}</td>
                <td>{x.createdAt ? new Date(x.createdAt).toLocaleString() : '-'}</td>
              </tr>
            ))

          )}
        </tbody>
      </table>
    </div>
  );
}
