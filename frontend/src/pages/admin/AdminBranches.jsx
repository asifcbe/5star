import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  name: '', address: '', city: '', state: '', phone: '', email: '', timings: '',
  googleMapLink: '', isActive: true, isComingSoon: false, order: 0
};

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/branches/admin/all').then(({ data }) => setBranches(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name, address: b.address, city: b.city || '', state: b.state || '', phone: b.phone || '',
      email: b.email || '', timings: b.timings || '', googleMapLink: b.googleMapLink || '',
      isActive: b.isActive, isComingSoon: b.isComingSoon, order: b.order || 0
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/api/branches/${editing._id}`, form);
      else await api.post('/api/branches', form);
      toast.success(`Branch ${editing ? 'updated' : 'created'}`);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error('Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this branch?')) return;
    await api.delete(`/api/branches/${id}`);
    toast.success('Branch deleted');
    load();
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Branches</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus style={{ marginRight: '0.4rem' }} /> Add Branch</button>
      </div>

      <div className="admin-cards">
        {branches.map((b) => (
          <div key={b._id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--gold-dark)' }}>{b.name}</strong>
              <span className={b.isActive ? 'badge badge-success' : 'badge badge-danger'}>{b.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{b.address}</p>
            {b.timings && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{b.timings}</p>}
            {b.isComingSoon && <span className="badge badge-warning" style={{ marginTop: '0.4rem', display: 'inline-block' }}>Coming Soon</span>}
            <div className="admin-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}><FiEdit2 size={14} /></button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Branch' : 'Add Branch'}</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="input-row input-row-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-control" name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-control" name="state" value={form.state} onChange={handleChange} />
                </div>
              </div>
              <div className="input-row input-row-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" name="email" value={form.email} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Timings</label>
                <input className="form-control" name="timings" value={form.timings} onChange={handleChange} placeholder="e.g. Mon-Sat 10AM-9PM" />
              </div>
              <div className="form-group">
                <label className="form-label">Google Maps Link</label>
                <input className="form-control" name="googleMapLink" value={form.googleMapLink} onChange={handleChange} />
              </div>
              <div className="input-row input-row-2">
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input className="form-control" type="number" name="order" value={form.order} onChange={handleChange} />
                </div>
                <div className="form-group admin-checks admin-check-cell">
                  <label>
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
                  </label>
                  <label>
                    <input type="checkbox" name="isComingSoon" checked={form.isComingSoon} onChange={handleChange} /> Coming Soon
                  </label>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Branch' : 'Create Branch'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBranches;
