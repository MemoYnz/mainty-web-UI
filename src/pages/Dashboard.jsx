import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getDashboard } from '../api/endpoints';

function WorkOrderCard({ x }) {
  return (
    <div
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
          Status: {String(x.status)} • Priority: {String(x.priority)} • Unit: {String(x.unitId)} • Area: {String(x.areaId)}
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>
          Created: {x.createdAt ? new Date(x.createdAt).toLocaleString() : '-'}
        </div>
      </div>
      <Link to={`/workorders/${x.workOrderId}`}>Open</Link>
    </div>
  );
}

function Section({ title, rightLinkText, rightLinkTo, emptyText, items }) {
  return (
    <div style={{ border: '1px solid #eee', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {rightLinkTo ? <Link to={rightLinkTo} style={{ fontSize: 14 }}>{rightLinkText}</Link> : null}
      </div>

      {(!items || items.length === 0) ? (
        <p style={{ marginTop: 10 }}>{emptyText}</p>
      ) : (
        <div style={{ marginTop: 10 }}>
          {items.map(x => <WorkOrderCard key={x.workOrderId} x={x} />)}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { me, loading: authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const role = me?.role.name || '';

  const isEngineer = role === 'Engineer';
  const isManager = role === 'EngineeringManager';
  const isOperator = role === 'Operator';
  const isQa = role === 'QA';
  const isProductionManager = role === 'ProductionManager';

  const supported = isEngineer || isManager || isOperator || isQa || isProductionManager;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setErr('');

      try {
        const res = await getDashboard(10);
        if (!isMounted) return;
        setData(res.data);
      } catch {
        if (isMounted) setErr('Failed to load dashboard data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!authLoading && me) load();

    return () => { isMounted = false; };
  }, [authLoading, me]);

  if (authLoading) return <div>Loading...</div>;
  if (!me) return <div>Unauthorized</div>;

  if (loading) return <div>Loading Dashboard...</div>;
  if (err) return <div style={{ color: 'red' }}>{err}</div>;

  return (
    <div>
      <h1>Dashboard</h1>

      {!supported ? (
        <div style={{ color: '#555' }}>
          Dashboard view for this role will be added later.
        </div>
      ) : null}

      {supported && isEngineer ? (
        <div style={{ display: 'grid', gap: 16, maxWidth: 1000 }}>
          <Section
            title="My Open Breakdowns"
            rightLinkText="Go to Breakdowns"
            rightLinkTo="/workorders"
            emptyText="No open breakdowns assigned to you."
            items={data?.myOpen || []}
          />

          <Section
            title="Unassigned New"
            rightLinkText="Go to Breakdowns"
            rightLinkTo="/workorders"
            emptyText="No unassigned new breakdowns."
            items={data?.unassignedNew || []}
          />

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
      ) : null}

      {supported && isManager ? (
        <div style={{ display: 'grid', gap: 16, maxWidth: 700 }}>
          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Manager Navigation</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/workorders">Manage Breakdowns</Link>
              <Link to="/shifttasks">ShiftTasks</Link>
              <Link to="/ppm">PPM</Link>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: '#555' }}>
              (Counts/overview will be added later.)
            </div>
          </div>
        </div>
      ) : null}

      {supported && isOperator ? (
        <div style={{ display: 'grid', gap: 16, maxWidth: 1000 }}>
          <Section
            title="My Open Breakdowns (Reported by Me)"
            rightLinkText=""
            rightLinkTo={null}
            emptyText="You have no open breakdowns reported by you."
            items={data?.myOpenReported || []}
          />
        </div>
      ) : null}

      {supported && isQa ? (
        <div style={{ display: 'grid', gap: 16, maxWidth: 1000 }}>
          <Section
            title="My Open Breakdowns (Reported by Me)"
            rightLinkText=""
            rightLinkTo={null}
            emptyText="You have no open breakdowns reported by you."
            items={data?.myOpenReported || []}
          />
          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Open QA Requests</h3>
            <div style={{ fontSize: 14, color: '#555' }}>
              (MVP later — we don’t have a list endpoint yet.)
            </div>
          </div>
        </div>
      ) : null}

      {supported && isProductionManager ? (
        <div style={{ display: 'grid', gap: 16, maxWidth: 1000 }}>
          <Section
            title="All Open Breakdowns"
            rightLinkText="Go to Breakdowns"
            rightLinkTo="/workorders"
            emptyText="No open breakdowns."
            items={data?.allOpen || []}
          />
        </div>
      ) : null}
    </div>
  );
}







// src/pages/Dashboard.jsx
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../auth/AuthContext';
// import { getDashboard } from '../api/endpoints';

// export default function Dashboard() {
//   const { me, loading: authLoading } = useAuth();

//   const [myOpen, setMyOpen] = useState([]);
//   const [unassignedNew, setUnassignedNew] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState('');

//   const roleName = me?.role?.name ?? me?.role ?? '';

//   useEffect(() => {
//     let isMounted = true;

//     const load = async () => {
//       if (!me) return;

//       setLoading(true);
//       setErr('');

//       try {
//         if (roleName === 'Engineer') {
//           const dashRes = await getDashboard(10);
//           if (!isMounted) return;

//           setMyOpen(dashRes.data?.myOpen || []);
//           setUnassignedNew(dashRes.data?.unassignedNew || []);
//         } else {
//           // For other roles: keep MVP simple (no data yet)
//           setMyOpen([]);
//           setUnassignedNew([]);
//         }
//       } catch {
//         if (isMounted) setErr('Failed to load dashboard data.');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     if (!authLoading && me) load();

//     return () => { isMounted = false; };
//   }, [authLoading, me, roleName]);

//   if (authLoading) return <div>Loading...</div>;
//   if (!me) return <div>Unauthorized</div>;

//   if (loading) return <div>Loading Dashboard...</div>;
//   if (err) return <div style={{ color: 'red' }}>{err}</div>;

//   const isEngineer = roleName === 'Engineer';

//   return (
//     <div>
//       <h1>Dashboard</h1>

//       {isEngineer ? (
//         <div style={{ display: 'grid', gap: 16, maxWidth: 1000 }}>
//           <div style={{ border: '1px solid #eee', padding: 12 }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h3 style={{ margin: 0 }}>My Open Breakdowns</h3>
//               <Link to="/workorders" style={{ fontSize: 14 }}>Go to Breakdowns</Link>
//             </div>

//             {myOpen.length === 0 ? (
//               <p style={{ marginTop: 10 }}>No open breakdowns assigned to you.</p>
//             ) : (
//               <div style={{ marginTop: 10 }}>
//                 {myOpen.map(x => (
//                   <div key={x.workOrderId ?? x} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <div style={{ fontWeight: 600 }}>Breakdown #{x.workOrderId ?? x}</div>
//                     </div>
//                     <Link to={`/workorders/${x.workOrderId ?? x}`}>Open</Link>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div style={{ border: '1px solid #eee', padding: 12 }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h3 style={{ margin: 0 }}>Unassigned New</h3>
//               <Link to="/workorders" style={{ fontSize: 14 }}>Go to Breakdowns</Link>
//             </div>

//             {unassignedNew.length === 0 ? (
//               <p style={{ marginTop: 10 }}>No unassigned new breakdowns.</p>
//             ) : (
//               <div style={{ marginTop: 10 }}>
//                 {unassignedNew.map(x => (
//                   <div key={x.workOrderId ?? x} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <div style={{ fontWeight: 600 }}>Breakdown #{x.workOrderId ?? x}</div>
//                     </div>
//                     <Link to={`/workorders/${x.workOrderId ?? x}`}>Open</Link>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div style={{ border: '1px solid #eee', padding: 12 }}>
//             <h3 style={{ marginTop: 0 }}>My Shift Tasks (Today)</h3>
//             <div style={{ fontSize: 14, color: '#555' }}>(MVP next)</div>
//             <div style={{ marginTop: 8 }}>
//               <Link to="/shifttasks">Go to ShiftTasks</Link>
//             </div>
//           </div>

//           <div style={{ border: '1px solid #eee', padding: 12 }}>
//             <h3 style={{ marginTop: 0 }}>PPM Plans</h3>
//             <div style={{ fontSize: 14, color: '#555' }}>(MVP next)</div>
//             <div style={{ marginTop: 8 }}>
//               <Link to="/ppm">Go to PPM</Link>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div style={{ color: '#555' }}>
//           Dashboard view for this role will be added later.
//         </div>
//       )}
//     </div>
//   );
// }



//19/01/26
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../auth/AuthContext';
// import { getDashboard } from '../api/endpoints';

// export default function Dashboard() {
//   const { me, loading: authLoading } = useAuth();

//   const [myOpen, setMyOpen] = useState([]);
//   const [unassignedNew, setUnassignedNew] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState('');

//   useEffect(() => {
//     let isMounted = true;

//     const load = async () => {
//       if (!me) return;

//       setLoading(true);
//       setErr('');

//       try {
//         if (me.role === 'Engineer') {
//           // ✅ FIX: getDashboard takes only (take)
//           const dashRes = await getDashboard(10);
//           if (!isMounted) return;

//           setMyOpen(dashRes.data?.myOpen || []);
//           setUnassignedNew(dashRes.data?.unassignedNew || []);
//         }
//       } catch {
//         if (isMounted) setErr('Failed to load dashboard data.');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     if (!authLoading && me) load();

//     return () => { isMounted = false; };
//   }, [authLoading, me]);

//   if (authLoading) return <div>Loading...</div>;
//   if (!me) return <div>Unauthorized</div>;

//   if (loading) return <div>Loading Dashboard...</div>;
//   if (err) return <div style={{ color: 'red' }}>{err}</div>;

//   // ✅ FIX: role is on me.role (not me.name)
//   const isEngineer = me.role.name === 'Engineer';

//   return (
//     <div>
//       <h1>Dashboard</h1>

//       {isEngineer ? (
//         <div style={{ display: 'grid', gap: 16, maxWidth: 1000 }}>
//           <div style={{ border: '1px solid #eee', padding: 12 }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h3 style={{ margin: 0 }}>My Open Breakdowns</h3>
//               <Link to="/workorders" style={{ fontSize: 14 }}>Go to Breakdowns</Link>
//             </div>

//             {myOpen.length === 0 ? (
//               <p style={{ marginTop: 10 }}>No open breakdowns assigned to you.</p>
//             ) : (
//               <div style={{ marginTop: 10 }}>
//                 {myOpen.map(x => (
//                   <div key={x.workOrderId} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <div style={{ fontWeight: 600 }}>Breakdown #{x.workOrderId}</div>
//                       <div style={{ fontSize: 12, color: '#555' }}>
//                         Status: {x.status} • Priority: {x.priority} • Unit: {x.unitId} • Area: {x.areaId}
//                       </div>
//                       <div style={{ fontSize: 12, color: '#555' }}>
//                         Created: {new Date(x.createdAt).toLocaleString()}
//                       </div>
//                     </div>
//                     <Link to={`/workorders/${x.workOrderId}`}>Open</Link>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div style={{ border: '1px solid #eee', padding: 12 }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h3 style={{ margin: 0 }}>Unassigned New</h3>
//               <Link to="/workorders" style={{ fontSize: 14 }}>Go to Breakdowns</Link>
//             </div>

//             {unassignedNew.length === 0 ? (
//               <p style={{ marginTop: 10 }}>No unassigned new breakdowns.</p>
//             ) : (
//               <div style={{ marginTop: 10 }}>
//                 {unassignedNew.map(x => (
//                   <div key={x.workOrderId} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <div style={{ fontWeight: 600 }}>Breakdown #{x.workOrderId}</div>
//                       <div style={{ fontSize: 12, color: '#555' }}>
//                         Status: {x.status} • Priority: {x.priority} • Unit: {x.unitId} • Area: {x.areaId}
//                       </div>
//                       <div style={{ fontSize: 12, color: '#555' }}>
//                         Created: {new Date(x.createdAt).toLocaleString()}
//                       </div>
//                     </div>
//                     <Link to={`/workorders/${x.workOrderId}`}>Open</Link>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div style={{ border: '1px solid #eee', padding: 12 }}>
//             <h3 style={{ marginTop: 0 }}>My Shift Tasks (Today)</h3>
//             <div style={{ fontSize: 14, color: '#555' }}>(MVP next)</div>
//             <div style={{ marginTop: 8 }}>
//               <Link to="/shifttasks">Go to ShiftTasks</Link>
//             </div>
//           </div>

//           <div style={{ border: '1px solid #eee', padding: 12 }}>
//             <h3 style={{ marginTop: 0 }}>PPM Plans</h3>
//             <div style={{ fontSize: 14, color: '#555' }}>(MVP next)</div>
//             <div style={{ marginTop: 8 }}>
//               <Link to="/ppm">Go to PPM</Link>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div style={{ color: '#555' }}>
//           Dashboard view for this role will be added later.
//         </div>
//       )}
//     </div>
//   );
// }



