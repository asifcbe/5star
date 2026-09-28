import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api, { getImageUrl, handleImageError } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  name: '', description: '', productType: 'bags', category: '', brand: '', sku: '',
  price: '', mrp: '', stock: '',
  material: '', capacity: '', color: '', dimensions: '', weight: '', warranty: '',
  featured: false, isActive: true, tags: '', variants: []
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const hasVariants = form.variants.length > 0;
  const visibleCategories = categories.filter((c) => c.productType === form.productType);

  const load = () => {
    setLoading(true);
    api.get('/api/products/admin/all').then(({ data }) => setProducts(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    api.get('/api/categories/admin/all').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    const firstCat = categories.find((c) => c.productType === 'bags');
    setForm({ ...emptyForm, category: firstCat?.slug || '' });
    setExistingImages([]);
    setNewFiles([]);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, productType: p.productType, category: p.category,
      brand: p.brand, sku: p.sku, price: p.price, mrp: p.mrp || '', stock: p.stock,
      material: p.material || '', capacity: p.capacity || '', color: p.color || '',
      dimensions: p.dimensions || '', weight: p.weight || '', warranty: p.warranty || '',
      featured: p.featured, isActive: p.isActive,
      tags: (p.tags || []).join(', '), variants: p.variants || []
    });
    setExistingImages(p.images || []);
    setNewFiles([]);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // When product family changes, reset category to first of that family
      if (name === 'productType') {
        const firstCat = categories.find((c) => c.productType === value);
        next.category = firstCat?.slug || '';
      }
      return next;
    });
  };

  const addVariant = () => setForm({ ...form, variants: [...form.variants, { name: '', value: '', sku: '', price: form.price || '', stock: '' }] });
  const updateVariant = (i, key, value) => {
    const next = [...form.variants];
    next[i] = { ...next[i], [key]: value };
    setForm({ ...form, variants: next });
  };
  const removeVariant = (i) => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasVariants) {
      const incomplete = form.variants.some((v) => !v.name || !v.value || v.price === '' || v.price === null);
      if (incomplete) {
        toast.error('Every variant needs an option name, value, and price');
        return;
      }
    }
    setSaving(true);
    try {
      const derivedPrice = hasVariants ? Math.min(...form.variants.map((v) => Number(v.price))) : form.price;
      const derivedStock = hasVariants ? form.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : form.stock;

      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'tags') fd.append('tags', JSON.stringify(value.split(',').map((t) => t.trim()).filter(Boolean)));
        else if (key === 'variants') fd.append('variants', JSON.stringify(value));
        else if (key === 'price') fd.append('price', derivedPrice);
        else if (key === 'stock') fd.append('stock', derivedStock);
        else if (key === 'mrp' && hasVariants) { /* omit MRP when variants exist */ }
        else fd.append(key, value);
      });
      if (editing) fd.append('existingImages', JSON.stringify(existingImages));
      newFiles.forEach((f) => fd.append('images', f));

      if (editing) await api.put(`/api/products/${editing._id}`, fd);
      else await api.post('/api/products', fd);

      toast.success(`Product ${editing ? 'updated' : 'created'}`);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus style={{ marginRight: '0.4rem' }} /> Add Product</button>
      </div>

      <div className="admin-section">
        <table className="data-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Brand</th><th>SKU</th><th>Family</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><img src={getImageUrl(p.images?.[0])} onError={handleImageError} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /></td>
                <td>{p.name}</td>
                <td>{p.brand}</td>
                <td>{p.sku}</td>
                <td style={{ textTransform: 'capitalize' }}>{p.productType}</td>
                <td style={{ textTransform: 'capitalize' }}>{p.category?.replace(/-/g, ' ')}</td>
                <td>₹{p.price}{p.variants?.length > 0 && <span className="badge badge-info" style={{ marginLeft: '0.4rem' }}>{p.variants.length} options</span>}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={p.isActive ? 'badge badge-success' : 'badge badge-danger'}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  {p.featured && <span className="badge badge-warning" style={{ marginLeft: '0.3rem' }}>Featured</span>}
                </td>
                <td>
                  <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm" style={{ marginRight: '0.4rem' }}><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(p._id)} className="btn btn-danger btn-sm"><FiTrash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 780 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-row input-row-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-control" name="brand" value={form.brand} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} required />
              </div>

              <div className="input-row input-row-3">
                <div className="form-group">
                  <label className="form-label">Product Family</label>
                  <select className="form-control" name="productType" value={form.productType} onChange={handleChange}>
                    <option value="bags">Bags</option>
                    <option value="jerkins">Jerkins</option>
                    <option value="trolleys">Trolleys</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  {visibleCategories.length > 0 ? (
                    <select className="form-control" name="category" value={form.category} onChange={handleChange} required>
                      <option value="" disabled>Select a category</option>
                      {visibleCategories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
                    </select>
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      No categories for this family. <Link to="/admin/categories" style={{ color: 'var(--gold-dark)' }}>Create one first</Link>.
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input className="form-control" name="sku" value={form.sku} onChange={handleChange} required />
                </div>
              </div>

              <div className="input-row input-row-3">
                <div className="form-group">
                  <label className="form-label">Price (₹){hasVariants && ' — set per variant below'}</label>
                  <input
                    className="form-control" type="number" name="price" value={form.price} onChange={handleChange}
                    required={!hasVariants} disabled={hasVariants}
                    style={hasVariants ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">MRP (₹, optional)</label>
                  <input
                    className="form-control" type="number" name="mrp" value={form.mrp} onChange={handleChange}
                    disabled={hasVariants}
                    style={hasVariants ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock{hasVariants && ' — set per variant below'}</label>
                  <input
                    className="form-control" type="number" name="stock" value={form.stock} onChange={handleChange}
                    required={!hasVariants} disabled={hasVariants}
                    style={hasVariants ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  />
                </div>
              </div>

              <div className="input-row input-row-3">
                <div className="form-group">
                  <label className="form-label">Material</label>
                  <input className="form-control" name="material" value={form.material} onChange={handleChange} placeholder="e.g. Polycarbonate" />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input className="form-control" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g. 55 cm / 38 L" />
                </div>
                <div className="form-group">
                  <label className="form-label">Colour</label>
                  <input className="form-control" name="color" value={form.color} onChange={handleChange} placeholder="e.g. Charcoal" />
                </div>
              </div>

              <div className="input-row input-row-3">
                <div className="form-group">
                  <label className="form-label">Dimensions</label>
                  <input className="form-control" name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="e.g. 55 × 38 × 22 cm" />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight</label>
                  <input className="form-control" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g. 2.6 kg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty</label>
                  <input className="form-control" name="warranty" value={form.warranty} onChange={handleChange} placeholder="e.g. 5 years" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. best-seller, travel" />
              </div>

              <div className="form-group">
                <label className="form-label">Variants (e.g. Size, Colour — optional)</label>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  If a product has options like size or colour, add them here. Each variant has its own price and stock, and customers pick one at checkout. Leave empty for a simple single-price product.
                </p>
                {form.variants.map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input className="form-control" placeholder="Option name (e.g. Size)" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} />
                    <input className="form-control" placeholder="Value (e.g. L)" value={v.value} onChange={(e) => updateVariant(i, 'value', e.target.value)} />
                    <input className="form-control" placeholder="Variant SKU (optional)" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} />
                    <input className="form-control" placeholder="Price (₹)" type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} style={{ maxWidth: 110 }} />
                    <input className="form-control" placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} style={{ maxWidth: 90 }} />
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeVariant(i)}><FiX size={14} /></button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={addVariant}><FiPlus size={14} style={{ marginRight: '0.3rem' }} /> Add Variant</button>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Images</label>
                {existingImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    {existingImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={getImageUrl(img)} onError={handleImageError} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4 }} />
                        <button type="button" onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))}
                          style={{ position: 'absolute', top: -6, right: -6, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: '0.6rem' }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" multiple accept="image/*" className="form-control" onChange={(e) => setNewFiles(Array.from(e.target.files))} />
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
