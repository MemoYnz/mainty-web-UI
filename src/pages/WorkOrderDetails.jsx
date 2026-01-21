import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  getWorkOrderById,
  claimWorkOrder,
  setWorkOrderStatus,
  requestQaTest,
  approveQaTest,
  rejectQaTest
} from '../api/endpoints';

export default function WorkOrderDetails() {
  // Status values (align with backend enum)
  const STATUS_DONE = 4; // Done
  const STATUS_VERIFIED = 5; // Verified (final)

  // QA enums (backend)
  const QA_TEST_SWAB = 1; // QaTestType.Swab (as you used)

  // ✅ Open statuses by your enum (0..3)
  const OPEN_STATUSES = [0, 1, 2, 3]; // New, Claimed, InProgress, WaitingParts

  const { id } = useParams();
  const { me, loading: authLoading } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  // Status change
  const [statusValue, setStatusValue] = useState('');
  const [comment, setComment] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Done => QA request UI (Engineer)
  const [requiresQa, setRequiresQa] = useState(false);
  const [qaNotes, setQaNotes] = useState('');

  // QA actions (QA role)
  const [qaActionLoading, setQaActionLoading] = useState(false);
  const [qaActionError, setQaActionError] = useState('');
  const [qaRejectComment, setQaRejectComment] = useState('');

  const load = async (isMountedFlag = true) => {
    setLoading(true);
    setError('');

    try {
      const res = await getWorkOrderById(id);
      if (isMountedFlag) setItem(res.data);
    } catch {
      if (isMountedFlag) setError('Failed to load Breakdown details');
    } finally {
      if (isMountedFlag) setLoading(false);
    }
  };

useEffect(() => {
  let isMounted = true;

  const init = async () => {
    if (!me) return;
    await load(isMounted);
  };

  if (!authLoading && me) init();

  return () => { isMounted = false; };
}, [authLoading, me, id]);


  // -------------------------
  // Render guards (Auth)
  // -------------------------
  if (authLoading) return <div>Loading...</div>;
  if (!me) return <div>Unauthorized</div>;

  // -------------------------
  // Render guards (Data)
  // -------------------------
  if (loading) return <div>Loading Breakdown...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!item) return <div>Not found</div>;

  // -------------------------
  // Role logic
  // -------------------------
  const role = me?.role.name || '';

  const isEngineer = role === 'Engineer';
  const isManager = role === 'EngineeringManager';
  const isOperator = role === 'Operator';
  const isQa = role === 'QA';
  const isProductionManager = role === 'ProductionManager';

  const isOpen = OPEN_STATUSES.includes(Number(item?.status));

  // ✅ Hide history for Operator and ProductionManager
  const canSeeHistory = !(isOperator || isProductionManager);

  // -------------------------
  // UI enforcement (client-side)
  // -------------------------
  // Operator: only his open breakdowns
  if (isOperator) {
    const ok = isOpen && item.reportedByUserId === me.userId;
    if (!ok) {
      return (
        <div>
          <h1>Breakdown</h1>
          <div style={{ color: '#555' }}>
            You can view only your own open breakdowns.
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/">← Back to Dashboard</Link>
          </div>
        </div>
      );
    }
  }

  // ProductionManager: only open breakdowns (all)
  if (isProductionManager) {
    if (!isOpen) {
      return (
        <div>
          <h1>Breakdown</h1>
          <div style={{ color: '#555' }}>
            Production Manager can view only open breakdowns.
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/">← Back to Dashboard</Link>
          </div>
        </div>
      );
    }
  }

  // QA: allow if (reported by QA AND open) OR (has open QA request)
  if (isQa) {
    const qaRequestOpen = item.qaStatus === 'New' || item.qaStatus === 'InProgress';
    const ok = (isOpen && item.reportedByUserId === me.userId) || qaRequestOpen;
    if (!ok) {
      return (
        <div>
          <h1>Breakdown</h1>
          <div style={{ color: '#555' }}>
            You can view only your own open breakdowns or ones with an open QA request.
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/">← Back to Dashboard</Link>
          </div>
        </div>
      );
    }
  }

  // -------------------------
  // Claim (Engineer)
  // -------------------------
  const onClaim = async () => {
    setClaimError('');

    const currentUserId = me?.userId;
    if (!currentUserId) {
      setClaimError('Cannot claim: missing current user id.');
      return;
    }

    try {
      setClaiming(true);
      await claimWorkOrder(id, currentUserId);
      await load(true);
    } catch {
      setClaimError('Cannot claim this breakdown.');
    } finally {
      setClaiming(false);
    }
  };

  // -------------------------
  // Set Status (Engineer)
  // - Done: comment required
  // - Other statuses: comment optional
  // - If Done AND requiresQa checked -> create QA request (RequiredForClose = true)
  // -------------------------
  const onSetStatus = async () => {
    setStatusError('');

    const currentUserId = me?.userId;
    if (!currentUserId) {
      setStatusError('Missing current user id.');
      return;
    }

    if (statusValue === '') {
      setStatusError('Please select a status.');
      return;
    }

    const nextStatus = Number(statusValue);

    // Comment required ONLY when Done
    if (nextStatus === STATUS_DONE && !comment.trim()) {
      setStatusError('Comment is required when status is Done.');
      return;
    }

    try {
      setSavingStatus(true);

      // If Done and "Requires QA" is checked -> create QA request first
      if (nextStatus === STATUS_DONE && requiresQa) {
        await requestQaTest(id, {
          requestedByUserId: currentUserId,
          testType: QA_TEST_SWAB,
          notes: qaNotes?.trim() ? qaNotes.trim() : null,
          requiredForClose: true
        });
      }

      // Set status
      await setWorkOrderStatus(id, {
        userId: currentUserId,
        status: nextStatus,
        comment: comment?.trim() ? comment.trim() : null
      });

      // reset inputs
      setStatusValue('');
      setComment('');
      setRequiresQa(false);
      setQaNotes('');

      await load(true);
    } catch {
      setStatusError('Failed to change status / request QA test.');
    } finally {
      setSavingStatus(false);
    }
  };

  const onStatusSelectChange = (v) => {
    setStatusValue(v);

    const next = v === '' ? null : Number(v);
    if (next !== STATUS_DONE) {
      setRequiresQa(false);
      setQaNotes('');
    }
  };

  // -------------------------
  // Permissions
  // -------------------------
  const isAssigned = !!item.assignedEngineerId;

  // Engineer can claim only if not assigned
  const canClaim = isEngineer && !isAssigned;

  // Engineer can change status only if assigned to him
  const canChangeStatus = isEngineer && item.assignedEngineerId === me?.userId;

  const closeBlockedByQa = item.qaBlockingClose === true;

  // ✅ QA actions are for QA role (not manager)
  const canShowQaActions =
    me?.role === 'QA' &&
    (item?.qaStatus === 'New' || item?.qaStatus === 'InProgress');

  const onApproveQa = async () => {
    setQaActionError('');

    const qaUserId = me?.userId;
    if (!qaUserId) {
      setQaActionError('Missing current user id.');
      return;
    }

    try {
      setQaActionLoading(true);
      await approveQaTest(id, { completedByUserId: qaUserId, comment: null });
      await load(true);
    } catch {
      setQaActionError('Failed to approve QA test.');
    } finally {
      setQaActionLoading(false);
    }
  };

  const onRejectQa = async () => {
    setQaActionError('');

    const qaUserId = me?.userId;
    if (!qaUserId) {
      setQaActionError('Missing current user id.');
      return;
    }

    if (!qaRejectComment.trim()) {
      setQaActionError('Reject comment is required.');
      return;
    }

    try {
      setQaActionLoading(true);
      await rejectQaTest(id, { completedByUserId: qaUserId, comment: qaRejectComment.trim() });
      setQaRejectComment('');
      await load(true);
    } catch {
      setQaActionError('Failed to reject QA test.');
    } finally {
      setQaActionLoading(false);
    }
  };

  return (
    <div>
      <Link to="/">← Back to Dashboard</Link>

      <h1>Breakdown #{item.workOrderId}</h1>

      {/* Assign to me (Engineer) */}
      {isEngineer && (
        <div style={{ margin: '12px 0 16px 0' }}>
          <button
            onClick={onClaim}
            disabled={!canClaim || claiming}
            style={{
              padding: '8px 12px',
              cursor: (!canClaim || claiming) ? 'not-allowed' : 'pointer',
              opacity: (!canClaim || claiming) ? 0.6 : 1
            }}
          >
            {claiming ? 'Assigning...' : 'Assign to me'}
          </button>

          {!canClaim && isAssigned && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
              Already assigned to Engineer #{item.assignedEngineerId}
            </div>
          )}

          {claimError && (
            <div style={{ marginTop: 8, color: 'red' }}>
              {claimError}
            </div>
          )}
        </div>
      )}

      {/* Change status (Engineer) */}
      {isEngineer && (
        <div style={{ margin: '12px 0 16px 0', border: '1px solid #eee', padding: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Change status</div>

          {!canChangeStatus && (
            <div style={{ marginBottom: 8, fontSize: 12, color: '#555' }}>
              You can change status only when the breakdown is assigned to you.
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <select
              value={statusValue}
              onChange={(e) => onStatusSelectChange(e.target.value)}
              disabled={!canChangeStatus || savingStatus}
            >
              <option value="">Select status...</option>
              <option value="2">InProgress</option>
              <option value="3">WaitingParts</option>
              <option value="4">Done</option>
              <option value="5" disabled={closeBlockedByQa}>Verified</option>
            </select>

            <button onClick={onSetStatus} disabled={!canChangeStatus || savingStatus}>
              {savingStatus ? 'Saving...' : 'Save'}
            </button>
          </div>

          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a short comment... (required only for Done)"
            style={{ width: '100%' }}
            disabled={!canChangeStatus || savingStatus}
          />

          {Number(statusValue) === STATUS_DONE && (
            <div style={{ marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={requiresQa}
                  onChange={(e) => setRequiresQa(e.target.checked)}
                  disabled={!canChangeStatus || savingStatus}
                />
                Requires QA test (Swab)
              </label>

              {requiresQa && (
                <div style={{ marginTop: 8 }}>
                  <textarea
                    rows={2}
                    value={qaNotes}
                    onChange={(e) => setQaNotes(e.target.value)}
                    placeholder="QA notes (optional)"
                    style={{ width: '100%' }}
                    disabled={!canChangeStatus || savingStatus}
                  />
                  <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
                    If QA is required-for-close, the breakdown cannot be Verified until QA is completed.
                  </div>
                </div>
              )}
            </div>
          )}

          {closeBlockedByQa && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
              Verified is blocked: QA test is required and still pending.
            </div>
          )}

          {statusError && <div style={{ color: 'red', marginTop: 8 }}>{statusError}</div>}
        </div>
      )}

      {/* QA Summary + Actions (QA) */}
      {(isQa || item.qaTestRequestId) && (
        <div style={{ margin: '12px 0 16px 0', border: '1px solid #eee', padding: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>QA</div>

          {item.qaTestRequestId ? (
            <div style={{ fontSize: 14 }}>
              <div><strong>Status:</strong> {item.qaStatus ?? '-'}</div>
              <div><strong>Type:</strong> {item.qaTestType ?? '-'}</div>
              <div><strong>Required for close:</strong> {item.qaRequiredForClose ? 'Yes' : 'No'}</div>
              <div><strong>Created:</strong> {item.qaCreatedAt ? new Date(item.qaCreatedAt).toLocaleString() : '-'}</div>
              <div><strong>Completed:</strong> {item.qaCompletedAt ? new Date(item.qaCompletedAt).toLocaleString() : '-'}</div>
              <div style={{ marginTop: 8 }}>
                <strong>Notes:</strong>
                <div style={{ background: '#f5f5f5', padding: 8, marginTop: 6 }}>
                  {item.qaNotes ?? '-'}
                </div>
              </div>

              {item.qaBlockingClose && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#555' }}>
                  This QA request is blocking Verified until it is completed.
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: '#555' }}>
              No QA requests.
            </div>
          )}

          {canShowQaActions && (
            <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 12 }}>
              <button onClick={onApproveQa} disabled={qaActionLoading}>
                {qaActionLoading ? 'Working...' : 'Approve QA (Passed)'}
              </button>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
                  Reject requires an explanation:
                </div>

                <textarea
                  rows={2}
                  value={qaRejectComment}
                  onChange={(e) => setQaRejectComment(e.target.value)}
                  placeholder="Reject comment (required)"
                  style={{ width: '100%' }}
                  disabled={qaActionLoading}
                />

                <button onClick={onRejectQa} disabled={qaActionLoading} style={{ marginTop: 8 }}>
                  {qaActionLoading ? 'Working...' : 'Reject QA (Failed)'}
                </button>
              </div>

              {qaActionError && (
                <div style={{ marginTop: 8, color: 'red' }}>
                  {qaActionError}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main info */}
      <div style={{ marginBottom: 16 }}>
        <p><strong>Status:</strong> {String(item.status)}</p>
        <p><strong>Priority:</strong> {String(item.priority)}</p>
        <p><strong>Unit:</strong> {String(item.unitId)}</p>
        <p><strong>Area:</strong> {String(item.areaId)}</p>
        <p><strong>Asset:</strong> {item.assetId ?? '-'}</p>
        <p><strong>Reported by:</strong> User #{item.reportedByUserId}</p>
        <p><strong>Assigned engineer:</strong> {item.assignedEngineerId ?? '-'}</p>
        <p><strong>Created at:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</p>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 24 }}>
        <h3>Description</h3>
        <div style={{ background: '#f5f5f5', padding: 12 }}>
          {item.description}
        </div>
      </div>

      {/* Updates (History) */}
      {canSeeHistory && (
        <div>
          <h3>History / Updates</h3>

          {item.updates?.length === 0 && <p>No updates</p>}

          {item.updates?.map(u => (
            <div
              key={u.workOrderUpdateId}
              style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}
            >
              <div><strong>Status:</strong> {u.status}</div>
              <div><strong>Comment:</strong> {u.comment}</div>
              <div>
                <small>
                  By user #{u.updatedByUserId} at {new Date(u.updatedAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { useAuth } from '../auth/AuthContext';
// import {
//   getWorkOrderById,
//   claimWorkOrder,
//   setWorkOrderStatus,
//   requestQaTest,
//   approveQaTest,
//   rejectQaTest
// } from '../api/endpoints';

// export default function WorkOrderDetails() {
//   // Status values (based on your backend enums)
//   const STATUS_DONE = 3;
//   const STATUS_CLOSED = 4;

//   // QA enums (your backend)
//   const QA_TEST_SWAB = 1; // QaTestType.Swab

//   const { id } = useParams();

//   const { me, loading: authLoading } = useAuth();

//   const [item, setItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Claim
//   const [claiming, setClaiming] = useState(false);
//   const [claimError, setClaimError] = useState('');

//   // Status change
//   const [statusValue, setStatusValue] = useState('');
//   const [comment, setComment] = useState('');
//   const [savingStatus, setSavingStatus] = useState(false);
//   const [statusError, setStatusError] = useState('');

//   // Done => QA request UI (Engineer)
//   const [requiresQa, setRequiresQa] = useState(false);
//   const [qaNotes, setQaNotes] = useState('');

//   // QA actions (QA role)
//   const [qaActionLoading, setQaActionLoading] = useState(false);
//   const [qaActionError, setQaActionError] = useState('');
//   const [qaRejectComment, setQaRejectComment] = useState('');

//   const role = me?.role || '';
//   const isEngineer = role === 'Engineer';
//   const isManager = role === 'EngineeringManager';
//   const isQa = role === 'QA';
//   const isProductionManager = role === 'ProductionManager';

//   const canSeeWorkOrdersList = isEngineer || isManager || isProductionManager;

//   const load = async (isMountedFlag = true) => {
//     setLoading(true);
//     setError('');

//     try {
//       const res = await getWorkOrderById(id);
//       if (isMountedFlag) setItem(res.data);
//     } catch {
//       if (isMountedFlag) setError('Failed to load Breakdown details');
//     } finally {
//       if (isMountedFlag) setLoading(false);
//     }
//   };

//   useEffect(() => {
//     let isMounted = true;

//     const init = async () => {
//       if (!me) return;
//       await load(isMounted);
//     };

//     if (!authLoading && me) init();

//     return () => { isMounted = false; };
//   }, [authLoading, me, id]);

//   // -------------------------
//   // Claim (Engineer)
//   // -------------------------
//   const onClaim = async () => {
//     setClaimError('');

//     const currentUserId = me?.userId;
//     if (!currentUserId) {
//       setClaimError('Cannot claim: missing current user id.');
//       return;
//     }

//     try {
//       setClaiming(true);
//       await claimWorkOrder(id, currentUserId);
//       await load(true);
//     } catch {
//       setClaimError('Cannot claim this breakdown.');
//     } finally {
//       setClaiming(false);
//     }
//   };

//   // -------------------------
//   // Set Status (Engineer)
//   // - Done: comment required
//   // - Other statuses: comment optional
//   // - If Done AND requiresQa checked -> create QA request (RequiredForClose = true)
//   // -------------------------
//   const onSetStatus = async () => {
//     setStatusError('');

//     const currentUserId = me?.userId;
//     if (!currentUserId) {
//       setStatusError('Missing current user id.');
//       return;
//     }

//     if (statusValue === '') {
//       setStatusError('Please select a status.');
//       return;
//     }

//     const nextStatus = Number(statusValue);

//     // Comment required ONLY when Done
//     if (nextStatus === STATUS_DONE && !comment.trim()) {
//       setStatusError('Comment is required when status is Done.');
//       return;
//     }

//     try {
//       setSavingStatus(true);

//       // If Done and "Requires QA" is checked -> create QA request first
//       if (nextStatus === STATUS_DONE && requiresQa) {
//         await requestQaTest(id, {
//           requestedByUserId: currentUserId,
//           testType: QA_TEST_SWAB,
//           notes: qaNotes?.trim() ? qaNotes.trim() : null,
//           requiredForClose: true
//         });
//       }

//       // Set status
//       await setWorkOrderStatus(id, {
//         userId: currentUserId,
//         status: nextStatus,
//         comment: comment?.trim() ? comment.trim() : null
//       });

//       // reset inputs
//       setStatusValue('');
//       setComment('');
//       setRequiresQa(false);
//       setQaNotes('');

//       await load(true);
//     } catch {
//       setStatusError('Failed to change status / request QA test.');
//     } finally {
//       setSavingStatus(false);
//     }
//   };

//   // If not Done -> hide QA checkbox and reset it
//   const onStatusSelectChange = (v) => {
//     setStatusValue(v);

//     const next = v === '' ? null : Number(v);
//     if (next !== STATUS_DONE) {
//       setRequiresQa(false);
//       setQaNotes('');
//     }
//   };

//   // -------------------------
//   // QA Actions (QA only)
//   // Approve: no comment required
//   // Reject: comment required
//   // -------------------------
//   const canShowQaActions =
//     isQa && (item?.qaStatus === 'New' || item?.qaStatus === 'InProgress');

//   const onApproveQa = async () => {
//     setQaActionError('');

//     const qaUserId = me?.userId;
//     if (!qaUserId) {
//       setQaActionError('Missing current user id.');
//       return;
//     }

//     try {
//       setQaActionLoading(true);
//       await approveQaTest(id, {
//         completedByUserId: qaUserId,
//         comment: null
//       });
//       await load(true);
//     } catch {
//       setQaActionError('Failed to approve QA test.');
//     } finally {
//       setQaActionLoading(false);
//     }
//   };

//   const onRejectQa = async () => {
//     setQaActionError('');

//     const qaUserId = me?.userId;
//     if (!qaUserId) {
//       setQaActionError('Missing current user id.');
//       return;
//     }

//     if (!qaRejectComment.trim()) {
//       setQaActionError('Reject comment is required.');
//       return;
//     }

//     try {
//       setQaActionLoading(true);
//       await rejectQaTest(id, {
//         completedByUserId: qaUserId,
//         comment: qaRejectComment.trim()
//       });
//       setQaRejectComment('');
//       await load(true);
//     } catch {
//       setQaActionError('Failed to reject QA test.');
//     } finally {
//       setQaActionLoading(false);
//     }
//   };

//   // -------------------------
//   // Render guards
//   // -------------------------
//   if (authLoading) return <div>Loading...</div>;
//   if (!me) return <div>Unauthorized</div>;

//   if (loading) return <div>Loading Breakdown...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;
//   if (!item) return <div>Not found</div>;

//   const isAssigned = !!item.assignedEngineerId;

//   // Engineer can claim only if not assigned
//   const canClaim = isEngineer && !isAssigned;

//   // Engineer can change status only if assigned to him
//   const canChangeStatus = isEngineer && item.assignedEngineerId === me?.userId;

//   const closeBlockedByQa = item.qaBlockingClose === true;

//   return (
//     <div>
//       {canSeeWorkOrdersList ? (
//         <Link to="/workorders">← Back to Breakdowns</Link>
//       ) : (
//         <Link to="/">← Back to Dashboard</Link>
//       )}

//       <h1>Breakdown #{item.workOrderId}</h1>

//       {/* Assign to me (Engineer) */}
//       {isEngineer && (
//         <div style={{ margin: '12px 0 16px 0' }}>
//           <button
//             onClick={onClaim}
//             disabled={!canClaim || claiming}
//             style={{
//               padding: '8px 12px',
//               cursor: (!canClaim || claiming) ? 'not-allowed' : 'pointer',
//               opacity: (!canClaim || claiming) ? 0.6 : 1
//             }}
//           >
//             {claiming ? 'Assigning...' : 'Assign to me'}
//           </button>

//           {!canClaim && isAssigned && (
//             <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
//               Already assigned to Engineer #{item.assignedEngineerId}
//             </div>
//           )}

//           {claimError && (
//             <div style={{ marginTop: 8, color: 'red' }}>
//               {claimError}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Change status (Engineer) */}
//       {isEngineer && (
//         <div style={{ margin: '12px 0 16px 0', border: '1px solid #eee', padding: 12 }}>
//           <div style={{ marginBottom: 8, fontWeight: 600 }}>Change status</div>

//           {!canChangeStatus && (
//             <div style={{ marginBottom: 8, fontSize: 12, color: '#555' }}>
//               You can change status only when the breakdown is assigned to you.
//             </div>
//           )}

//           <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
//             <select
//               value={statusValue}
//               onChange={(e) => onStatusSelectChange(e.target.value)}
//               disabled={!canChangeStatus || savingStatus}
//             >
//               <option value="">Select status...</option>
//               <option value="1">InProgress</option>
//               <option value="2">Waiting</option>
//               <option value="3">Done</option>
//               <option value="4" disabled={closeBlockedByQa}>Closed</option>
//             </select>

//             <button onClick={onSetStatus} disabled={!canChangeStatus || savingStatus}>
//               {savingStatus ? 'Saving...' : 'Save'}
//             </button>
//           </div>

//           <textarea
//             rows={3}
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             placeholder="Write a short comment... (required only for Done)"
//             style={{ width: '100%' }}
//             disabled={!canChangeStatus || savingStatus}
//           />

//           {/* Done => Requires QA (Swab) */}
//           {Number(statusValue) === STATUS_DONE && (
//             <div style={{ marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
//               <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                 <input
//                   type="checkbox"
//                   checked={requiresQa}
//                   onChange={(e) => setRequiresQa(e.target.checked)}
//                   disabled={!canChangeStatus || savingStatus}
//                 />
//                 Requires QA test (Swab)
//               </label>

//               {requiresQa && (
//                 <div style={{ marginTop: 8 }}>
//                   <textarea
//                     rows={2}
//                     value={qaNotes}
//                     onChange={(e) => setQaNotes(e.target.value)}
//                     placeholder="QA notes (optional)"
//                     style={{ width: '100%' }}
//                     disabled={!canChangeStatus || savingStatus}
//                   />
//                   <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
//                     If QA is requested as required-for-close, the breakdown cannot be Closed until QA is completed.
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {closeBlockedByQa && (
//             <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
//               Close is blocked: QA test is required and still pending.
//             </div>
//           )}

//           {statusError && <div style={{ color: 'red', marginTop: 8 }}>{statusError}</div>}
//         </div>
//       )}

//       {/* QA Summary + Actions (QA + Manager can view summary; actions QA only) */}
//       {(isManager || isQa || item.qaTestRequestId) && (
//         <div style={{ margin: '12px 0 16px 0', border: '1px solid #eee', padding: 12 }}>
//           <div style={{ marginBottom: 8, fontWeight: 600 }}>QA</div>

//           {item.qaTestRequestId ? (
//             <div style={{ fontSize: 14 }}>
//               <div><strong>Status:</strong> {item.qaStatus ?? '-'}</div>
//               <div><strong>Type:</strong> {item.qaTestType ?? '-'}</div>
//               <div><strong>Required for close:</strong> {item.qaRequiredForClose ? 'Yes' : 'No'}</div>
//               <div><strong>Created:</strong> {item.qaCreatedAt ? new Date(item.qaCreatedAt).toLocaleString() : '-'}</div>
//               <div><strong>Completed:</strong> {item.qaCompletedAt ? new Date(item.qaCompletedAt).toLocaleString() : '-'}</div>
//               <div style={{ marginTop: 8 }}>
//                 <strong>Notes:</strong>
//                 <div style={{ background: '#f5f5f5', padding: 8, marginTop: 6 }}>
//                   {item.qaNotes ?? '-'}
//                 </div>
//               </div>

//               {item.qaBlockingClose && (
//                 <div style={{ marginTop: 10, fontSize: 12, color: '#555' }}>
//                   This QA request is blocking Close until it is completed (Passed/Failed/Cancelled).
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div style={{ fontSize: 14, color: '#555' }}>
//               No QA requests.
//             </div>
//           )}

//           {canShowQaActions && (
//             <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 12 }}>
//               <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
//                 <button onClick={onApproveQa} disabled={qaActionLoading}>
//                   {qaActionLoading ? 'Working...' : 'Approve QA (Passed)'}
//                 </button>
//               </div>

//               <div style={{ marginTop: 8 }}>
//                 <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
//                   Reject requires an explanation:
//                 </div>

//                 <textarea
//                   rows={2}
//                   value={qaRejectComment}
//                   onChange={(e) => setQaRejectComment(e.target.value)}
//                   placeholder="Reject comment (required)"
//                   style={{ width: '100%' }}
//                   disabled={qaActionLoading}
//                 />

//                 <button
//                   onClick={onRejectQa}
//                   disabled={qaActionLoading}
//                   style={{ marginTop: 8 }}
//                 >
//                   {qaActionLoading ? 'Working...' : 'Reject QA (Failed)'}
//                 </button>
//               </div>

//               {qaActionError && (
//                 <div style={{ marginTop: 8, color: 'red' }}>
//                   {qaActionError}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Main info */}
//       <div style={{ marginBottom: 16 }}>
//         <p><strong>Status:</strong> {String(item.status)}</p>
//         <p><strong>Priority:</strong> {String(item.priority)}</p>
//         <p><strong>Unit:</strong> {String(item.unitId)}</p>
//         <p><strong>Area:</strong> {String(item.areaId)}</p>
//         <p><strong>Asset:</strong> {item.assetId ?? '-'}</p>
//         <p><strong>Reported by:</strong> User #{item.reportedByUserId}</p>
//         <p><strong>Assigned engineer:</strong> {item.assignedEngineerId ?? '-'}</p>
//         <p><strong>Created at:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</p>
//       </div>

//       {/* Description */}
//       <div style={{ marginBottom: 24 }}>
//         <h3>Description</h3>
//         <div style={{ background: '#f5f5f5', padding: 12 }}>
//           {item.description}
//         </div>
//       </div>

//       {/* Updates (hidden for ProductionManager) */}
//       {!isProductionManager && (
//         <div>
//           <h3>History / Updates</h3>

//           {item.updates?.length === 0 && <p>No updates</p>}

//           {item.updates?.map(u => (
//             <div
//               key={u.workOrderUpdateId}
//               style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}
//             >
//               <div><strong>Status:</strong> {String(u.status)}</div>
//               <div><strong>Comment:</strong> {u.comment}</div>
//               <div>
//                 <small>
//                   By user #{u.updatedByUserId} at {new Date(u.updatedAt).toLocaleString()}
//                 </small>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
