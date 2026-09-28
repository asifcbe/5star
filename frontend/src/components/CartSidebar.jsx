import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getImageUrl, handleImageError } from '../utils/api';

const CartSidebar = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQty, subtotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const goCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(40,32,15,0.55)', zIndex: 600 }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 100%)',
        background: 'var(--black-rich)', borderLeft: '1px solid var(--black-border)',
        zIndex: 601, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--black-border)'
        }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--gold-dark)', fontWeight: 400 }}>Your Cart</h3>
          <button className="modal-close" onClick={() => setIsOpen(false)}><FiX size={22} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <FiShoppingBag size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Your cart is empty. Add a bag, jerkin or trolley to get started.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} style={{
                display: 'flex', gap: '0.85rem', padding: '0.85rem 0',
                borderBottom: '1px solid var(--black-border)'
              }}>
                <img
                  src={getImageUrl(item.image)}
                  onError={handleImageError}
                  alt={item.name}
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius)', background: 'var(--black-surface)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.2rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {item.brand} · {item.sku}{item.variantLabel ? ` · ${item.variantLabel}` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.key, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.key, item.quantity + 1)}>+</button>
                    </div>
                    <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--black-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.05rem' }}>
              <span>Subtotal</span>
              <strong style={{ color: 'var(--gold-dark)' }}>₹{subtotal}</strong>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={goCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
