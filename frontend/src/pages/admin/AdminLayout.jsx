import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBox, FiShoppingBag, FiTag, FiSettings, FiImage, FiMapPin, FiLogOut, FiMenu, FiX, FiLayers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

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
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'gold-white');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: collapsed ? 68 : 230, background: 'var(--black-card)', borderRight: '1px solid var(--black-border)',
        transition: 'width 0.2s ease', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1rem', borderBottom: '1px solid var(--black-border)' }}>
          {!collapsed && <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-dark)', fontSize: '1.15rem', letterSpacing: '0.06em' }}>5STAR</span>}
          <button onClick={() => setCollapsed((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 0.8rem',
              borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '0.85rem',
              color: isActive ? 'var(--gold-dark)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(var(--accent-rgb),0.1)' : 'transparent'
            })}>
              {item.icon}{!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem 0.6rem', borderTop: '1px solid var(--black-border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 0.8rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <FiGrid size={17} />{!collapsed && 'View Store'}
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 0.8rem', width: '100%',
            background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem'
          }}>
            <FiLogOut size={17} />{!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem', background: 'var(--black)', overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
