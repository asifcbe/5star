import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

const StatusTimeline = ({ status }) => {
  if (status === 'cancelled') return <div className="badge badge-danger">Cancelled</div>;
  const activeIdx = STATUS_STEPS.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '1rem 0' }}>
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', margin: '0 auto 0.3rem',
              background: i <= activeIdx ? 'var(--gold)' : 'var(--black-border)',
              color: i <= activeIdx ? '#ffffff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700
            }}>{i + 1}</div>
            <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: i <= activeIdx ? 'var(--gold-dark)' : 'var(--text-muted)' }}>{step}</div>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < activeIdx ? 'var(--gold)' : 'var(--black-border)', marginBottom: '1.1rem' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const OrderCard = ({ order }) => (
  <div className="admin-section">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <strong style={{ color: 'var(--gold-dark)' }}>#{order.orderId}</strong>
      <strong>₹{order.total}</strong>
    </div>
    <StatusTimeline status={order.orderStatus} />
    {order.items.map((item, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', color: 'var(--text-secondary)' }}>
        <span>{item.name}{item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}</span>
        <span>₹{item.price * item.quantity}</span>
      </div>
    ))}
  </div>
);

const TrackOrder = () => {
  const [mode, setMode] = useState('orderId');
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrders(null);
    try {
      if (mode === 'orderId') {
        const { data } = await api.get(`/api/orders/track/${query.trim()}`);
        setOrders([data]);
      } else {
        const { data } = await api.get(`/api/orders/track-phone/${query.trim()}`);
        setOrders(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'No orders found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Track Order</h1>
          <p>Check the status of your order anytime</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 640, padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button className={mode === 'orderId' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => setMode('orderId')}>By Order ID</button>
          <button className={mode === 'phone' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => setMode('phone')}>By Phone Number</button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input
            className="form-control"
            placeholder={mode === 'orderId' ? 'Enter Order ID' : 'Enter Phone Number'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button className="btn btn-primary">Track</button>
        </form>

        {loading && <LoadingSpinner />}
        {orders && orders.map((o) => <OrderCard key={o._id} order={o} />)}
      </div>
    </div>
  );
};

export default TrackOrder;
