import { useEffect, useState } from 'react';
import api from '../api/axios';

const TYPES = ['house', 'apartment', 'condo', 'land', 'commercial'];
const STATUSES = ['available', 'under_offer', 'sold', 'rented', 'off_market'];

const emptyForm = {
  title: '', description: '', propertyType: 'house', status: 'available', price: '',
  address: '', city: '', state: '', zipCode: '', bedrooms: '', bathrooms: '', areaSqft: '',
};

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadListings() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/listings', { params });
      setListings(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadListings(); }, [statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(listing) {
    setEditingId(listing.id);
    setForm({
      title: listing.title, description: listing.description || '',
      propertyType: listing.propertyType, status: listing.status, price: listing.price,
      address: listing.address, city: listing.city, state: listing.state || '',
      zipCode: listing.zipCode || '', bedrooms: listing.bedrooms || '',
      bathrooms: listing.bathrooms || '', areaSqft: listing.areaSqft || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/listings/${editingId}`, form);
      } else {
        await api.post('/listings', form);
      }
      setShowModal(false);
      loadListings();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this listing?')) return;
    await api.delete(`/listings/${id}`);
    loadListings();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Listings</h1>
          <p className="page-subtitle">Manage the properties on your books.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New listing</button>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search by title or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadListings()}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={loadListings}>Filter</button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading listings…</div>
        ) : listings.length === 0 ? (
          <div className="empty-state">No listings yet. Add your first property.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Address</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Agent</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td>{listing.title}</td>
                  <td>{listing.address}, {listing.city}</td>
                  <td>{listing.propertyType}</td>
                  <td>${Number(listing.price).toLocaleString()}</td>
                  <td><span className={`badge badge-${listing.status}`}>{listing.status.replace('_', ' ')}</span></td>
                  <td>{listing.agent?.name || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => openEdit(listing)} style={{ marginRight: 8 }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(listing.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit listing' : 'New listing'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="field">
                <label>Property type</label>
                <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Price</label>
                <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="field">
                <label>Address</label>
                <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="field">
                <label>City</label>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="field">
                <label>State</label>
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="field">
                <label>ZIP code</label>
                <input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
              </div>
              <div className="field">
                <label>Bedrooms</label>
                <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
              </div>
              <div className="field">
                <label>Bathrooms</label>
                <input type="number" step="0.5" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
              </div>
              <div className="field">
                <label>Area (sqft)</label>
                <input type="number" value={form.areaSqft} onChange={(e) => setForm({ ...form, areaSqft: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save listing'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

