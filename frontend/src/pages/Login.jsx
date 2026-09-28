import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 440, padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.7rem', textAlign: 'center', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Welcome Back</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Login to track your orders and check out faster.</p>
      <form onSubmit={handleSubmit} className="admin-section">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--gold-dark)' }}>Register</Link>
      </p>
    </div>
  );
};

export default Login;
