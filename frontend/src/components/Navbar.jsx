import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api, { getImageUrl } from '../utils/api';
import logo from '../assets/logo.svg';

const NAV_LINKS = [
  { to: '/shop', label: 'Shop All' },
  { to: '/shop?productType=bags', label: 'Bags' },
  { to: '/shop?productType=jerkins', label: 'Jerkins' },
  { to: '/shop?productType=trolleys', label: 'Trolleys' },
  { to: '/track-order', label: 'Track Order' },
  { to: '/contactus', label: 'Contact' }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => setSettings(data)).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
      background: scrolled ? 'rgba(var(--surface-rgb),0.98)' : 'rgba(var(--surface-rgb),0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--black-border)',
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      transition: 'var(--transition)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <img
            src={settings?.logo ? getImageUrl(settings.logo) : logo}
            alt={settings?.storeName || '5Star'}
            style={{ height: 46, width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        <div className="nav-links" style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} style={{
              color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8rem',
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: 'var(--font-accent)'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <button onClick={() => setIsOpen(true)} style={{
            position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)'
          }}>
            <FiShoppingCart size={22} />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -8, background: 'var(--gold)', color: '#ffffff',
                borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
              }}>{itemCount}</span>
            )}
          </button>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setUserMenuOpen((v) => !v)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)'
            }}>
              <FiUser size={22} />
            </button>
            {userMenuOpen && (
              <div style={{
                position: 'absolute', top: '140%', right: 0, background: 'var(--black-card)',
                border: '1px solid var(--black-border)', borderRadius: 'var(--radius-lg)',
                minWidth: 180, padding: '0.5rem', boxShadow: 'var(--shadow-lg)'
              }}>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={dropdownItemStyle}>
                        <FiSettings size={15} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/my-orders" onClick={() => setUserMenuOpen(false)} style={dropdownItemStyle}>
                      <FiPackage size={15} /> My Orders
                    </Link>
                    <button onClick={handleLogout} style={{ ...dropdownItemStyle, width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                      <FiLogOut size={15} /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setUserMenuOpen(false)} style={dropdownItemStyle}>
                    Login / Register
                  </Link>
                )}
              </div>
            )}
          </div>

          <button className="mobile-toggle" onClick={() => setMobileOpen((v) => !v)} style={{
            display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer'
          }}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ background: 'var(--black-rich)', borderTop: '1px solid var(--black-border)', padding: '1rem 1.5rem' }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} style={{
              display: 'block', padding: '0.7rem 0', color: 'var(--text-secondary)', textDecoration: 'none'
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .nav-links { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

const dropdownItemStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem',
  color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem',
  borderRadius: 'var(--radius)', textAlign: 'left'
};

export default Navbar;
