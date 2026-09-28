import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiTrash2, FiUpload, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import api, { getImageUrl, handleImageError } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminLanding = () => {
  const [landing, setLanding] = useState(null);
  const [saving, setSaving] = useState(false);
  const [carouselFile, setCarouselFile] = useState(null);
  const [carouselMeta, setCarouselMeta] = useState({ alt: '', caption: '', subcaption: '' });
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editMeta, setEditMeta] = useState({ alt: '', caption: '', subcaption: '' });
  const [editFile, setEditFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = () => api.get('/api/landing').then(({ data }) => setLanding(data));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setLanding({ ...landing, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/api/landing', {
        heroTitle: landing.heroTitle,
        heroSubtitle: landing.heroSubtitle,
        historyTitle: landing.historyTitle,
        historyText: landing.historyText,
        youtubeVideoId: landing.youtubeVideoId,
        youtubeTitle: landing.youtubeTitle
      });
      setLanding(data);
      toast.success('Landing page updated');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const uploadCarousel = async () => {
    if (!carouselFile) return toast.error('Choose an image first');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', carouselFile);
      fd.append('alt', carouselMeta.alt);
      fd.append('caption', carouselMeta.caption);
      fd.append('subcaption', carouselMeta.subcaption);
      const { data } = await api.post('/api/landing/carousel', fd);
      setLanding(data);
      setCarouselFile(null);
      setCarouselMeta({ alt: '', caption: '', subcaption: '' });
      toast.success('Slide added');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteCarousel = async (imageId) => {
    if (!window.confirm('Remove this slide?')) return;
    const { data } = await api.delete(`/api/landing/carousel/${imageId}`);
    setLanding(data);
  };

  const startEdit = (img) => {
    setEditingId(img._id);
    setEditMeta({ alt: img.alt || '', caption: img.caption || '', subcaption: img.subcaption || '' });
    setEditFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFile(null);
  };

  const saveEdit = async (imageId) => {
    setSavingEdit(true);
    try {
      const fd = new FormData();
      fd.append('alt', editMeta.alt);
      fd.append('caption', editMeta.caption);
      fd.append('subcaption', editMeta.subcaption);
      if (editFile) fd.append('image', editFile);
      const { data } = await api.put(`/api/landing/carousel/${imageId}`, fd);
      setLanding(data);
      setEditingId(null);
      setEditFile(null);
      toast.success('Slide updated');
    } catch (err) {
      toast.error('Failed to update slide');
    } finally {
      setSavingEdit(false);
    }
  };

  if (!landing) return <LoadingSpinner fullPage />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Landing Page</h1>

      <form onSubmit={handleSubmit}>
        <div className="admin-section">
          <div className="admin-section-title">Hero Section</div>
          <div className="form-group">
            <label className="form-label">Hero Title</label>
            <input className="form-control" name="heroTitle" value={landing.heroTitle || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Hero Subtitle</label>
            <input className="form-control" name="heroSubtitle" value={landing.heroSubtitle || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-title">Our Story</div>
          <div className="form-group">
            <label className="form-label">Story Title</label>
            <input className="form-control" name="historyTitle" value={landing.historyTitle || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Story Text</label>
            <textarea className="form-control" name="historyText" value={landing.historyText || ''} onChange={handleChange} />
          </div>
          <div className="input-row input-row-2">
            <div className="form-group">
              <label className="form-label">YouTube Video ID</label>
              <input className="form-control" name="youtubeVideoId" value={landing.youtubeVideoId || ''} onChange={handleChange} placeholder="e.g. dQw4w9WgXcQ" />
            </div>
            <div className="form-group">
              <label className="form-label">Video Section Title</label>
              <input className="form-control" name="youtubeTitle" value={landing.youtubeTitle || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Landing Content'}</button>
      </form>

      <div className="admin-section" style={{ marginTop: '1.5rem' }}>
        <div className="admin-section-title">Hero Carousel Slides</div>

        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          {(landing.carouselImages || []).map((img) => (
            <div key={img._id} className="card" style={{ padding: '0.75rem' }}>
              {editingId === img._id ? (
                <>
                  <img
                    src={editFile ? URL.createObjectURL(editFile) : getImageUrl(img.url)}
                    onError={handleImageError}
                    alt={img.alt}
                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 4, marginBottom: '0.5rem' }}
                  />
                  <input
                    type="file" accept="image/*" className="form-control"
                    style={{ marginBottom: '0.5rem', fontSize: '0.78rem' }}
                    onChange={(e) => setEditFile(e.target.files[0])}
                  />
                  <input
                    className="form-control" placeholder="Caption" value={editMeta.caption}
                    style={{ marginBottom: '0.5rem' }}
                    onChange={(e) => setEditMeta({ ...editMeta, caption: e.target.value })}
                  />
                  <input
                    className="form-control" placeholder="Subcaption" value={editMeta.subcaption}
                    style={{ marginBottom: '0.5rem' }}
                    onChange={(e) => setEditMeta({ ...editMeta, subcaption: e.target.value })}
                  />
                  <input
                    className="form-control" placeholder="Alt text" value={editMeta.alt}
                    style={{ marginBottom: '0.65rem' }}
                    onChange={(e) => setEditMeta({ ...editMeta, alt: e.target.value })}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-primary btn-sm" style={{ flex: 1 }}
                      disabled={savingEdit} onClick={() => saveEdit(img._id)}
                    >
                      <FiCheck size={13} style={{ marginRight: '0.3rem' }} /> {savingEdit ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={savingEdit}>
                      <FiX size={13} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img src={getImageUrl(img.url)} onError={handleImageError} alt={img.alt} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 4, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>{img.caption || <span style={{ color: 'var(--text-muted)' }}>No caption</span>}</p>
                  {img.subcaption && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{img.subcaption}</p>}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => startEdit(img)}>
                      <FiEdit2 size={13} style={{ marginRight: '0.3rem' }} /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCarousel(img._id)}><FiTrash2 size={13} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="admin-section-title" style={{ fontSize: '0.85rem' }}>Add New Slide</div>
        <div className="input-row input-row-3" style={{ marginBottom: '0.75rem' }}>
          <input className="form-control" placeholder="Caption" value={carouselMeta.caption} onChange={(e) => setCarouselMeta({ ...carouselMeta, caption: e.target.value })} />
          <input className="form-control" placeholder="Subcaption" value={carouselMeta.subcaption} onChange={(e) => setCarouselMeta({ ...carouselMeta, subcaption: e.target.value })} />
          <input className="form-control" placeholder="Alt text" value={carouselMeta.alt} onChange={(e) => setCarouselMeta({ ...carouselMeta, alt: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => setCarouselFile(e.target.files[0])} />
          <button type="button" className="btn btn-outline" onClick={uploadCarousel} disabled={uploading}>
            <FiUpload style={{ marginRight: '0.4rem' }} /> {uploading ? 'Uploading...' : 'Add Slide'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;
