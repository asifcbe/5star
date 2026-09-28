import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiDollarSign, FiBox, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/orders/stats'),
      api.get('/api/products/admin/all'),
      api.get('/api/orders?limit=5')
    ]).then(([statsRes, productsRes, ordersRes]) => {
      setStats(statsRes.data);
      setProductCount(productsRes.data.length);
      setRecentOrders(ordersRes.data.orders || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const cards = [
    { label: 'Total Orders', value: stats?.total || 0, icon: <FiShoppingBag size={20} /> },
    { label: 'Revenue', value: `₹${stats?.revenue || 0}`, icon: <FiDollarSign size={20} /> },
    { label: 'Products', value: productCount, icon: <FiBox size={20} /> },
    { label: 'Delivered', value: stats?.byStatus?.delivered || 0, icon: <FiCheckCircle size={20} /> }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Dashboard</h1>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div style={{ color: 'var(--gold-dark)', marginBottom: '0.75rem' }}>{c.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <div className="admin-section-title">Order Status Breakdown</div>
        <div className="grid-4">
          {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
            <div key={status} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--black-surface)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-dark)' }}>{count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-title">Recent Orders</div>
        <table className="data-table">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Status</th><th>Total</th></tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o._id}>
                <td>#{o.orderId}</td>
                <td>{o.customerInfo?.name}</td>
                <td><span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>{o.orderStatus}</span></td>
                <td>₹{o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/admin/orders" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--gold-dark)', fontSize: '0.85rem' }}>View all orders &rarr;</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
