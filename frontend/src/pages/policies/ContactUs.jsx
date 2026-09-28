import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ContactUs = () => {
  const [settings, setSettings] = useState(null);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => setSettings(data)).catch(() => {});
    api.get('/api/branches').then(({ data }) => setBranches(data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Thanks for reaching out! We will get back to you shortly.');
    setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    setSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="container"><h1>Contact Us</h1><p>We're here to help with orders, sizing &amp; warranty</p></div>
      </div>

      <div className="container" style={{ padding: '3rem 2rem 5rem' }}>
        <div className="grid-2" style={{ gap: '3rem', alignItems: 'flex-start' }}>
          <form onSubmit={handleSubmit} className="admin-section">
            <div className="admin-section-title">Send a Message</div>
            <div className="input-row input-row-2">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-control" name="subject" value={form.subject} onChange={handleChange}>
                <option>General Inquiry</option>
                <option>Order Support</option>
                <option>Sizing / Fit Question</option>
                <option>Warranty Claim</option>
                <option>Bulk / Corporate Inquiry</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-control" name="message" value={form.message} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div>
            <div className="admin-section">
              <div className="admin-section-title">Get in Touch</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>{settings?.storeEmail || 'support@fivestar.example.com'}</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>{settings?.storePhone || '+91 XXXXXXXXXX'}</p>
              <p style={{ color: 'var(--text-secondary)' }}>{settings?.storeAddress || 'Address available soon'}</p>
            </div>

            {branches.map((b) => (
              <div key={b._id} className="admin-section">
                <h3 style={{ fontSize: '1rem', color: 'var(--gold-dark)', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>{b.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.address}</p>
                {b.timings && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{b.timings}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
