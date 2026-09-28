import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiPackage } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_TABS = ['all', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'];

const StatusTimeline = ({ status }) => {
  if (status === 'cancelled') {
    return <div className="badge badge-danger">Cancelled</div>;
  }
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

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/api/orders/my').then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? orders : orders.filter((o) => o.orderStatus === tab);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container" style={{ padding: '3rem 2rem 5rem' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>My Orders</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setTab(s)} className={tab === s ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} style={{ textTransform: 'capitalize' }}>
            {s} ({s === 'all' ? orders.length : orders.filter((o) => o.orderStatus === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <FiPackage size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No orders yet. Your first bag, jerkin or trolley is a click away.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
        </div>
      ) : (
        filtered.map((order) => (
          <div key={order._id} className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
              <div>
                <strong style={{ color: 'var(--gold-dark)' }}>#{order.orderId}</strong>
                <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>{order.orderStatus}</span>
                <strong>₹{order.total}</strong>
                {expanded === order._id ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </div>

            {expanded === order._id && (
              <div style={{ marginTop: '1rem' }}>
                <StatusTimeline status={order.orderStatus} />
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', color: 'var(--text-secondary)' }}>
                    <span>{item.name}{item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--black-border)', marginTop: '0.75rem', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <p>{order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.pincode}</p>
                  <p style={{ marginTop: '0.4rem' }}>Payment: {order.paymentMethod.toUpperCase()} · {order.paymentStatus}</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
