import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const getRemaining = (expiryDate) => {
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
};

const CouponTimer = () => {
  const [coupon, setCoupon] = useState(null);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    api.get('/api/coupons/expiring').then(({ data }) => setCoupon(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!coupon) return;
    const tick = () => {
      const r = getRemaining(coupon.expiryDate);
      setRemaining(r);
      if (!r) setCoupon(null);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [coupon]);

  if (!coupon || !remaining) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
      color: '#ffffff', padding: '0.75rem 1rem', textAlign: 'center',
      fontSize: '0.85rem', fontWeight: 600, display: 'flex', gap: '0.75rem',
      alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'
    }}>
      <span>Use code <strong>{coupon.code}</strong> — {coupon.description || 'limited time offer'}</span>
      <span style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
        Ends in {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
      </span>
    </div>
  );
};

export default CouponTimer;
