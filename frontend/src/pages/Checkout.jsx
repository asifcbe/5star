import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    address: '', city: '', state: '', pincode: '', notes: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [checkoutCoupons, setCheckoutCoupons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [settings, setSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) navigate('/shop');
  }, [items, navigate]);

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => setSettings(data)).catch(() => {});
    api.get('/api/coupons/checkout').then(({ data }) => setCheckoutCoupons(data)).catch(() => {});
  }, []);

  const discount = appliedCoupon?.discount || 0;
  const shippingCharge = paymentMethod === 'cod' ? (settings?.codCharge ?? 100) : (settings?.shippingCharge ?? 0);
  const total = Math.max(subtotal - discount, 0) + shippingCharge;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyCoupon = async (code) => {
    try {
      const { data } = await api.post('/api/coupons/validate', { code, subtotal });
      setAppliedCoupon(data);
      setCouponCode(data.code);
      toast.success(`Coupon ${data.code} applied`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); };

  const buildItemsPayload = () => items.map((i) => ({ productId: i.productId, variantId: i.variantId || undefined, quantity: i.quantity }));

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!form[field]) { toast.error(`Please fill in ${field}`); return false; }
    }
    return true;
  };

  const handleCOD = async () => {
    const { data } = await api.post('/api/orders', {
      customerInfo: form,
      items: buildItemsPayload(),
      couponCode: appliedCoupon?.code,
      paymentMethod: 'cod'
    });
    clearCart();
    navigate(`/order-confirmation/${data.orderId}`);
  };

  const handleRazorpay = async () => {
    const { data } = await api.post('/api/payment/create-order', {
      customerInfo: form,
      items: buildItemsPayload(),
      couponCode: appliedCoupon?.code
    });

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: settings?.storeName || '5Star',
      description: `${settings?.storeName || '5Star'} order`,
      order_id: data.razorpayOrderId,
      handler: async (response) => {
        try {
          const verifyRes = await api.post('/api/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            customerInfo: form,
            items: buildItemsPayload(),
            couponCode: appliedCoupon?.code
          });
          clearCart();
          navigate(`/order-confirmation/${verifyRes.data.orderId}`);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment verification failed');
        }
      },
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: '#b8860b' }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (paymentMethod === 'cod') await handleCOD();
      else await handleRazorpay();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 2rem 5rem' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Checkout</h1>
      <div className="grid-2" style={{ gap: '3rem', alignItems: 'flex-start' }}>
        <form onSubmit={handleSubmit}>
          <div className="admin-section">
            <div className="admin-section-title">Delivery Information</div>
            <div className="input-row input-row-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-control" name="address" value={form.address} onChange={handleChange} required />
            </div>
            <div className="input-row input-row-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-control" name="state" value={form.state} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-control" name="pincode" value={form.pincode} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Order Notes (optional)</label>
              <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} />
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-title">Payment Method</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                Pay Online (Razorpay)
              </label>
              {settings?.codEnabled !== false && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  Cash on Delivery {settings?.codCharge ? `(+₹${settings.codCharge} fee)` : ''}
                </label>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-xl" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Processing...' : `Place Order — ₹${total}`}
          </button>
        </form>

        <div className="admin-section" style={{ position: 'sticky', top: 90 }}>
          <div className="admin-section-title">Order Summary</div>
          {items.map((i) => (
            <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--text-secondary)' }}>
              <span>{i.name}{i.variantLabel ? ` (${i.variantLabel})` : ''} × {i.quantity}</span>
              <span>₹{i.price * i.quantity}</span>
            </div>
          ))}

          <div style={{ margin: '1rem 0' }}>
            {appliedCoupon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">{appliedCoupon.code} applied</span>
                <button type="button" onClick={removeCoupon} className="btn btn-ghost btn-sm">Remove</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="form-control" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => applyCoupon(couponCode)}>Apply</button>
              </div>
            )}
            {checkoutCoupons.length > 0 && !appliedCoupon && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                {checkoutCoupons.map((c) => (
                  <button type="button" key={c.code} onClick={() => applyCoupon(c.code)} className="badge badge-gold" style={{ cursor: 'pointer', border: 'none' }}>
                    {c.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--black-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>Subtotal</span><span>₹{subtotal}</span></div>
            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success)' }}><span>Discount</span><span>-₹{discount.toFixed(0)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>Shipping</span><span>{shippingCharge ? `₹${shippingCharge}` : 'Free'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold-dark)', marginTop: '0.5rem' }}>
              <span>Total</span><span>₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
