import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import api, { getImageUrl } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const RESET_PHRASE = 'DELETE ALL DATA';

const THEMES = [
  { id: 'gold-white', name: 'Gold & White', swatches: ['#b8860b', '#ffffff', '#2a2419'] },
  { id: 'onyx-gold', name: 'Onyx & Gold', swatches: ['#d4af37', '#12100b', '#f6ecd0'] },
  { id: 'champagne', name: 'Champagne', swatches: ['#a68a4b', '#ffffff', '#33301f'] },
  { id: 'espresso-gold', name: 'Espresso & Gold', swatches: ['#e0b64a', '#211b12', '#f7eccf'] }
];

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => setSettings(data));
  }, []);

  const handleResetAllData = async () => {
    if (resetConfirmText !== RESET_PHRASE) {
      toast.error(`Type "${RESET_PHRASE}" exactly to confirm`);
      return;
    }
    setResetting(true);
    try {
      await api.delete('/api/settings/reset-all-data', { data: { confirm: resetConfirmText } });
      toast.success('All store data deleted. Logging out...');
      setResetModalOpen(false);
      setTimeout(() => {
        logout();
        navigate('/');
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset data');
    } finally {
      setResetting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSocialChange = (key, value) => {
    setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [key]: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      ['storeName', 'storeTagline', 'storeEmail', 'storePhone', 'storeAddress', 'codEnabled', 'metaDescription', 'shippingCharge', 'codCharge', 'theme']
        .forEach((key) => fd.append(key, settings[key] ?? ''));
      fd.append('socialLinks', JSON.stringify(settings.socialLinks || {}));
      if (logoFile) fd.append('logo', logoFile);

      const { data } = await api.put('/api/settings', fd);
      setSettings(data);
      document.documentElement.setAttribute('data-theme', 'gold-white');
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <LoadingSpinner fullPage />;

  return (
    <div>
      <h1 className="admin-page-title">Settings</h1>
      <form onSubmit={handleSubmit}>
        <div className="admin-section">
          <div className="admin-section-title">Store Branding</div>
          {settings.logo && <img src={getImageUrl(settings.logo)} alt="logo" style={{ height: 48, marginBottom: '1rem' }} />}
          <div className="form-group">
            <label className="form-label">Logo</label>
            <input type="file" accept="image/*" className="form-control" onChange={(e) => setLogoFile(e.target.files[0])} />
          </div>
          <div className="input-row input-row-2">
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input className="form-control" name="storeName" value={settings.storeName || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="form-control" name="storeTagline" value={settings.storeTagline || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Meta Description</label>
            <textarea className="form-control" name="metaDescription" value={settings.metaDescription || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-title">Contact Info</div>
          <div className="input-row input-row-2">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" name="storeEmail" value={settings.storeEmail || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" name="storePhone" value={settings.storePhone || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-control" name="storeAddress" value={settings.storeAddress || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-title">Social Media Links</div>
          <div className="input-row input-row-2">
            <div className="form-group">
              <label className="form-label">Instagram</label>
              <input className="form-control" value={settings.socialLinks?.instagram || ''} onChange={(e) => handleSocialChange('instagram', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook</label>
              <input className="form-control" value={settings.socialLinks?.facebook || ''} onChange={(e) => handleSocialChange('facebook', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">YouTube</label>
              <input className="form-control" value={settings.socialLinks?.youtube || ''} onChange={(e) => handleSocialChange('youtube', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input className="form-control" value={settings.socialLinks?.whatsapp || ''} onChange={(e) => handleSocialChange('whatsapp', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-title">Payment &amp; Shipping</div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Razorpay Key ID is configured via the backend .env file (RAZORPAY_KEY_ID), not here.
          </p>
          <div className="input-row input-row-2">
            <div className="form-group">
              <label className="form-label">Online Shipping Charge (₹)</label>
              <input className="form-control" type="number" name="shippingCharge" value={settings.shippingCharge ?? ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">COD Charge (₹)</label>
              <input className="form-control" type="number" name="codCharge" value={settings.codCharge ?? ''} onChange={handleChange} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <input type="checkbox" name="codEnabled" checked={settings.codEnabled} onChange={handleChange} /> Enable Cash on Delivery
          </label>
        </div>

        <div className="admin-section">
          <div className="admin-section-title">Store Theme</div>
          <div className="grid-3 admin-tiles">
            {THEMES.map((t) => (
              <div key={t.id} onClick={() => setSettings({ ...settings, theme: t.id })} style={{
                cursor: 'pointer', padding: '1rem', borderRadius: 'var(--radius)',
                border: settings.theme === t.id ? '2px solid var(--gold)' : '1px solid var(--black-border)'
              }}>
                <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
                  {t.swatches.map((s, i) => <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: s, border: '1px solid var(--black-border)' }} />)}
                </div>
                <span style={{ fontSize: '0.82rem' }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg admin-save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>

      <div className="admin-section" style={{ border: '1px solid rgba(192,57,43,0.35)', marginTop: '2rem' }}>
        <div className="admin-section-title" style={{ color: 'var(--danger)' }}>
          <FiAlertTriangle size={16} /> Danger Zone
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Permanently deletes every product, order, coupon, branch, category, and landing page image, and resets
          store settings to defaults. Your admin login is kept so you can log back in. This cannot be undone —
          use this only to wipe test/dummy data before going live.
        </p>
        <button type="button" className="btn btn-danger" onClick={() => { setResetConfirmText(''); setResetModalOpen(true); }}>
          Delete All Data
        </button>
      </div>

      {resetModalOpen && (
        <div className="modal-overlay" onClick={() => !resetting && setResetModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--danger)' }}><FiAlertTriangle size={18} /> Delete All Data</div>
              <button className="modal-close" onClick={() => setResetModalOpen(false)}><FiX size={20} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              This will permanently delete all products, orders, coupons, branches, categories, landing page content, and
              uploaded images, then reset store settings to defaults. This action cannot be undone.
            </p>
            <div className="form-group">
              <label className="form-label">Type "{RESET_PHRASE}" to confirm</label>
              <input
                className="form-control" value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder={RESET_PHRASE} autoFocus
              />
            </div>
            <button
              className="btn btn-danger" style={{ width: '100%' }}
              disabled={resetting || resetConfirmText !== RESET_PHRASE}
              onClick={handleResetAllData}
            >
              {resetting ? 'Deleting everything...' : 'Permanently Delete All Data'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
