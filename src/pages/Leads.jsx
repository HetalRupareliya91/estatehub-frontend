import { useEffect, useState } from 'react';
import api from '../api/axios';

const STAGES = ['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'];
const SOURCES = ['website', 'referral', 'walk_in', 'phone', 'social_media', 'other'];
const INTERESTS = ['buy', 'sell', 'rent'];

const emptyForm = { name: '', email: '', phone: '', source: 'website', interestType: 'buy', budget: '', notes: '' };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadLeads() {
    setLoading(true);
    try {
      const params = {};
      if (stageFilter) params.stage = stageFilter;
      if (search) params.search = search;
      const { data } = await api.get('/leads', { params });
      setLeads(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLeads(); }, [stageFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(lead) {
    setEditingId(lead.id);
    setForm({
      name: lead.name, email: lead.email || '', phone: lead.phone || '',
      source: lead.source, interestType: lead.interestType,
      budget: lead.budget || '', notes: lead.notes || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/leads/${editingId}`, form);
      } else {
        await api.post('/leads', form);
      }
      setShowModal(false);
      loadLeads();
    } finally {
      setSaving(false);
    }
  }

  async function handleStageChange(lead, stage) {
    await api.patch(`/leads/${lead.id}`, { stage });
    loadLeads();
  }

  async function handleDelete(id) {
    if (!confirm('Remove this lead?')) return;
    await api.delete(`/leads/${id}`);
    loadLeads();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <p className="page-subtitle">Track prospects from first contact through close.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New lead</button>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
        />
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={loadLeads}>Filter</button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading leads…</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">No leads yet. Add your first one to start the pipeline.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Interest</th>
                <th>Budget</th>
                <th>Stage</th>
                <th>Agent</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.email || lead.phone || '—'}</td>
                  <td>{lead.interestType}</td>
                  <td>{lead.budget ? `$${Number(lead.budget).toLocaleString()}` : '—'}</td>
                  <td>
                    <select
                      value={lead.stage}
                      onChange={(e) => handleStageChange(lead, e.target.value)}
                      className={`badge badge-${lead.stage}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{lead.agent?.name || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => openEdit(lead)} style={{ marginRight: 8 }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(lead.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit lead' : 'New lead'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label>Source</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Interested in</label>
                <select value={form.interestType} onChange={(e) => setForm({ ...form, interestType: e.target.value })}>
                  {INTERESTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Budget</label>
                <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

