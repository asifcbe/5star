import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '',
  maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true, showOnCheckout: false
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/coupons').then(({ data }) => setCoupons(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || '', discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '',
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 16) : '',
      isActive: c.isActive, showOnCheckout: c.showOnCheckout
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
      if (editing) await api.put(`/api/coupons/${editing._id}`, form);
      else await api.post('/api/coupons', form);
      toast.success(`Coupon ${editing ? 'updated' : 'created'}`);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await api.delete(`/api/coupons/${id}`);
    toast.success('Coupon deleted');
    load();
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Coupons</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus style={{ marginRight: '0.4rem' }} /> Add Coupon</button>
      </div>

      <div className="grid-3">
        {coupons.map((c) => (
          <div key={c._id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--gold-dark)', fontSize: '1.1rem' }}>{c.code}</strong>
              <span className={c.isActive ? 'badge badge-success' : 'badge badge-danger'}>{c.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{c.description}</p>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
              {c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Min order ₹{c.minOrderAmount || 0} · Used {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Expires {new Date(c.expiryDate).toLocaleString()}</p>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><FiEdit2 size={14} /></button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Coupon' : 'Add Coupon'}</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-row input-row-2">
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input className="form-control" name="code" value={form.code} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select className="form-control" name="discountType" value={form.discountType} onChange={handleChange}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-control" name="description" value={form.description} onChange={handleChange} />
              </div>
              <div className="input-row input-row-3">
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input className="form-control" type="number" name="discountValue" value={form.discountValue} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Order Amount</label>
                  <input className="form-control" type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} />
                </div>
                {form.discountType === 'percentage' && (
                  <div className="form-group">
                    <label className="form-label">Max Discount</label>
                    <input className="form-control" type="number" name="maxDiscount" value={form.maxDiscount} onChange={handleChange} />
                  </div>
                )}
              </div>
              <div className="input-row input-row-2">
                <div className="form-group">
                  <label className="form-label">Usage Limit (optional)</label>
                  <input className="form-control" type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-control" type="datetime-local" name="expiryDate" value={form.expiryDate} onChange={handleChange} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" name="showOnCheckout" checked={form.showOnCheckout} onChange={handleChange} /> Show on Checkout
                </label>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Coupon' : 'Create Coupon'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
