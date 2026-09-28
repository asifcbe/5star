import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { FiCheckCircle, FiPrinter } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  useEffect(() => {
    api.get(`/api/orders/track/${orderId}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!order) return <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>Order not found.</div>;

  return (
    <div className="container" style={{ padding: '3rem 2rem 5rem', maxWidth: 720 }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <FiCheckCircle size={54} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.7rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Order Confirmed</h1>
        <p style={{ color: 'var(--text-muted)' }}>Thank you, {order.customerInfo.name}. Your order is on its way.</p>
      </div>

      <div className="admin-section print-slip" ref={printRef}>
        <div className="admin-section-title">Order #{order.orderId}</div>
        <div className="slip-row"><span className="slip-label">Date</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
        <div className="slip-row"><span className="slip-label">Status</span><span style={{ textTransform: 'capitalize' }}>{order.orderStatus}</span></div>
        <div className="slip-row"><span className="slip-label">Payment</span><span>{order.paymentMethod.toUpperCase()} · {order.paymentStatus}</span></div>

        <div style={{ margin: '1rem 0', borderTop: '1px solid var(--black-border)', paddingTop: '1rem' }}>
          {order.items.map((item, i) => (
            <div key={i} className="slip-row">
              <span className="slip-label">{item.name}{item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--black-border)', paddingTop: '0.75rem' }}>
          <div className="slip-row"><span className="slip-label">Subtotal</span><span>₹{order.subtotal}</span></div>
          {order.discount > 0 && <div className="slip-row"><span className="slip-label">Discount</span><span>-₹{order.discount}</span></div>}
          <div className="slip-row"><span className="slip-label">Shipping</span><span>{order.shippingCharge ? `₹${order.shippingCharge}` : 'Free'}</span></div>
          <div className="slip-row" style={{ fontWeight: 700, color: 'var(--gold-dark)' }}><span className="slip-label">Total</span><span>₹{order.total}</span></div>
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--black-border)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong>Delivery Address</strong>
          <p>{order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.pincode}</p>
          <p>{order.customerInfo.phone} · {order.customerInfo.email}</p>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
        <button className="btn btn-outline" onClick={handlePrint}><FiPrinter style={{ marginRight: '0.4rem' }} /> Print Receipt</button>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
