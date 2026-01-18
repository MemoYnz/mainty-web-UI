import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getWorkOrders, getOpenWorkOrders } from '../api/endpoints';

export default function WorkOrders() {
  const { me, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = me?.role || '';

  const isEngineer = role === 'Engineer';
  const isManager = role === 'EngineeringManager';
  const isProductionManager = role === 'ProductionManager';
  const isOperator = role === 'Operator';
  const isQa = role === 'QA';

  const canAccessList = isEngineer || isManager || isProductionManager;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!me) return;

      // UI enforcement: block Operator/QA from list page
      if (!canAccessList) {
        setLoading(false);
        setItems([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = isProductionManager
          ? await getOpenWorkOrders(200)
          : await getWorkOrders(); // full list

        if (!isMounted) return;

        setItems(res.data || []);
      } catch {
        if (isMounted) setError('Failed to load Breakdowns');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!authLoading && me) load();

       () => { isMounted = false; };
  }, [authLoading, me, canAccessList, isProductionManager]);

  if (authLoading) return <div>Loading...</div>;
  if (!me) return <div>Unauthorized</div>;

  // Hard UI block (even if user types /workorders manually)
  if (!canAccessList) {
    return (
      <div>
        <h1>Breakdowns</h1>
        <div style={{ color: '#555' }}>
          {isOperator && 'Operator access: use Dashboard only (your open breakdowns).'}
          {isQa && 'QA access: use Dashboard only (your open breakdowns + open QA requests).'}
          {!isOperator && !isQa && 'This view is not available for your role.'}
        </div>

        <div style={{ marginTop: 10 }}>
          <Link to="/">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading Breakdowns...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Breakdowns</h1>

      {isProductionManager && (
        <div style={{ marginBottom: 10, fontSize: 13, color: '#555' }}>
          Production Manager view: showing <strong>open</strong> breakdowns only.
        </div>
      )}

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>UnitId</th>
            <th>AreaId</th>
            <th>ReportedBy</th>
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
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td>{x.workOrderId ?? x.id}</td>
                <td>{x.description ?? '-'}</td>
                <td>{String(x.status ?? '-')}</td>
                <td>{x.unitId ?? '-'}</td>
                <td>{x.areaId ?? '-'}</td>
                <td>{x.reportedByUserId ?? '-'}</td>
                <td>{x.createdAt ? new Date(x.createdAt).toLocaleString() : '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}







// import React, { useEffect, useState } from 'react';
// import { getWorkOrders } from '../api/endpoints';
// import { useNavigate } from 'react-router-dom';


// export default function WorkOrders() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();


//   useEffect(() => {
//     let isMounted = true;

//     const load = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const res = await getWorkOrders();
//         if (isMounted) setItems(res.data || []);
//       } catch (e) {
//         if (isMounted) setError('Failed to load Breakdowns');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     load();
//     return () => { isMounted = false; };
//   }, []);

//   if (loading) return <div>Loading Breakdowns...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;

//   return (
//     <div>
//       <h1>Breakdowns</h1>

//       <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Title</th>
//             <th>Status</th>
//             <th>UnitId</th>
//             <th>AreaId</th>
//             <th>CreatedBy</th>
//             <th>CreatedAt</th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.length === 0 ? (
//             <tr>
//               <td colSpan="7">No breakdowns</td>
//             </tr>
//           ) : (
//             items.map((x) => (
//               <tr
//                 key={x.workOrderId ?? x.id}
//                 onClick={() => navigate(`/workorders/${x.workOrderId ?? x.id}`)}
//                 style={{ cursor: 'pointer' }}
//                 onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
//                 onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
//               >
//                 <td>{x.workOrderId ?? x.id}</td>
//                 <td>{x.title ?? '-'}</td>
//                 <td>{String(x.status ?? '-')}</td>
//                 <td>{x.unitId ?? '-'}</td>
//                 <td>{x.areaId ?? '-'}</td>
//                 <td>{x.createdByUserId ?? '-'}</td>
//                 <td>{x.createdAt ? new Date(x.createdAt).toLocaleString() : '-'}</td>
//               </tr>
//             ))

//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }
