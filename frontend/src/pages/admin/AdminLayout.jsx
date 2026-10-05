import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid, FiBox, FiShoppingBag, FiTag, FiSettings, FiImage, FiMapPin, FiLogOut, FiMenu, FiX, FiLayers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: <FiGrid size={17} />, end: true },
  { to: '/admin/products', label: 'Products', icon: <FiBox size={17} /> },
  { to: '/admin/categories', label: 'Categories', icon: <FiLayers size={17} /> },
  { to: '/admin/orders', label: 'Orders', icon: <FiShoppingBag size={17} /> },
  { to: '/admin/coupons', label: 'Coupons', icon: <FiTag size={17} /> },
  { to: '/admin/landing', label: 'Landing Page', icon: <FiImage size={17} /> },
  { to: '/admin/branches', label: 'Branches', icon: <FiMapPin size={17} /> },
  { to: '/admin/settings', label: 'Settings', icon: <FiSettings size={17} /> }
];

const AdminLayout = () => {
  // Start icon-only on tablets so content gets the width; below 768px the drawer ignores this
  const [collapsed, setCollapsed] = useState(() => window.matchMedia('(max-width:1024px)').matches);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // The mobile drawer always shows labels, even if the desktop sidebar is collapsed
  const narrow = collapsed && !mobileOpen;
  const current = NAV_ITEMS.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'gold-white');
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <button className="admin-icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu"><FiMenu size={20} /></button>
        <span className="admin-brand">5STAR</span>
        <span className="admin-topbar-title">· {current?.label || 'Admin'}</span>
      </header>

      <div className={`admin-backdrop${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />

      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-head">
          {!narrow && <span className="admin-brand">5STAR</span>}
          <button
            className="admin-icon-btn"
            onClick={() => (mobileOpen ? setMobileOpen(false) : setCollapsed((v) => !v))}
            aria-label={narrow ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {narrow ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        </div>

        <nav style={{ padding: '1rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} title={item.label} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 0.8rem',
              borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '0.85rem',
              color: isActive ? 'var(--gold-dark)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(var(--accent-rgb),0.1)' : 'transparent'
            })}>
              {item.icon}{!narrow && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot" style={{ padding: '1rem 0.6rem', borderTop: '1px solid var(--black-border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 0.8rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <FiGrid size={17} />{!narrow && 'View Store'}
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 0.8rem', width: '100%',
            background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem'
          }}>
            <FiLogOut size={17} />{!narrow && 'Logout'}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
