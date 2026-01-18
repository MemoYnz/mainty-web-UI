import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createWorkOrder } from '../api/endpoints';

export default function CreateBreakdowns() {
  const navigate = useNavigate();
  const { me, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    unitId: '',
    areaId: '',
    assetId: '', 
    priority: '',// optional
    description: ''
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!me?.userId) return;

    setErr('');

    const payload = {
      unitId: Number(form.unitId),
      areaId: Number(form.areaId),
      assetId: form.assetId === '' ? null : Number(form.assetId),
      reportedByUserId: me.userId,
      priority: Number(form.priority),
      description: form.description?.trim() || ''
    };

    // basic validation
    if (!payload.unitId || !payload.areaId || !payload.assetId || !payload.description) {
      setErr('UnitId, AreaId, assetId and Description are required.');
      return;
    }

    try {
      setSaving(true);
      const res = await createWorkOrder(payload);
      const createdId = res?.data?.workOrderId;

      if (createdId) {
        navigate(`/workorders/${createdId}`);
      } else {
        // fallback
        navigate('/workorders');
      }
    } catch (e2) {
      setErr(e2?.response?.data ?? 'Error creating breakdown');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (!me) return <div>Unauthorized</div>;

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 10 }}>
        <Link to="/">← Back to Dashboard</Link>
      </div>

      <h1>Create Breakdown</h1>

      <div style={{ marginBottom: 10, color: '#555' }}>
        Reported by: <strong>{me.fullName ?? `User #${me.userId}`}</strong>
      </div>

      {err && <div style={{ color: 'red', marginBottom: 10 }}>{err}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
        <input name="unitId" placeholder="Unit ID" value={form.unitId} onChange={handleChange} />
        <input name="areaId" placeholder="Area ID" value={form.areaId} onChange={handleChange} />
        <input name="assetId" placeholder="Asset ID (optional)" value={form.assetId} onChange={handleChange} />
        <input name="priority" placeholder="Priority (number)" value={form.priority} onChange={handleChange} />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={4}
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
