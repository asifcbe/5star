import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const PRODUCT_TYPES = ['bags', 'jerkins', 'trolleys'];
const emptyForm = { name: '', productType: 'bags', order: 0, isActive: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/categories/admin/all').then(({ data }) => setCategories(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, productType: c.productType || 'bags', order: c.order || 0, isActive: c.isActive });
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
      if (editing) await api.put(`/api/categories/${editing._id}`, form);
      else await api.post('/api/categories', form);
      toast.success(`Category ${editing ? 'updated' : 'created'}`);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Categories</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus style={{ marginRight: '0.4rem' }} /> Add Category</button>
      </div>

      <div className="admin-section">
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          These categories power the "Category" dropdown when creating products and the Shop by Category section on the homepage. Each category belongs to one product family (bags / jerkins / trolleys).
        </p>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Family</th><th>Slug</th><th>Order</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td style={{ textTransform: 'capitalize' }}>{c.productType}</td>
                <td style={{ color: 'var(--text-muted)' }}>{c.slug}</td>
                <td>{c.order}</td>
                <td><span className={c.isActive ? 'badge badge-success' : 'badge badge-danger'}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button onClick={() => openEdit(c)} className="btn btn-ghost btn-sm" style={{ marginRight: '0.4rem' }}><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(c._id)} className="btn btn-danger btn-sm"><FiTrash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No categories yet. Add your first one.</p>}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Cabin Trolleys" required />
              </div>
              <div className="input-row input-row-3">
                <div className="form-group">
                  <label className="form-label">Product Family</label>
                  <select className="form-control" name="productType" value={form.productType} onChange={handleChange}>
                    {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input className="form-control" type="number" name="order" value={form.order} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
                  </label>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
