import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 440, padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.7rem', textAlign: 'center', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Create Account</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Join 5Star for faster checkout and order tracking.</p>
      <form onSubmit={handleSubmit} className="admin-section">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone (optional)</label>
          <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input className="form-control" type="password" name="confirm" value={form.confirm} onChange={handleChange} required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--gold-dark)' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;
