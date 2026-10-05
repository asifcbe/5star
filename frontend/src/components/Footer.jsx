import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiMessageCircle } from 'react-icons/fi';
import api, { getImageUrl } from '../utils/api';
import logo from '../assets/logo.svg';

/*
 * Footer uses a fixed dark palette (not theme variables) so the white logo chip
 * and light text stay legible regardless of the active storefront theme.
 */
const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => setSettings(data)).catch(() => {});
  }, []);

  return (
    <footer style={{ background: '#221c12', borderTop: '1px solid rgba(212,175,55,0.18)', paddingTop: '3.5rem' }}>
      <div className="container grid-4" style={{ paddingBottom: '2.5rem' }}>
        <div>
          <div style={{
            display: 'inline-block', background: '#ffffff', borderRadius: 'var(--radius-lg)',
            padding: '0.75rem 1rem', marginBottom: '0.75rem'
          }}>
            <img
              src={settings?.logo ? getImageUrl(settings.logo) : logo}
              alt={settings?.storeName || '5Star'}
              style={{ height: 44, width: 'auto', display: 'block' }}
            />
          </div>
          <p style={{ color: '#c9bd9c', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {settings?.storeTagline || 'Bags, Jerkins & Trolleys — Built to Travel.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {settings?.socialLinks?.instagram && (
              <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" style={socialIconStyle}><FiInstagram size={16} /></a>
            )}
            {settings?.socialLinks?.facebook && (
              <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" style={socialIconStyle}><FiFacebook size={16} /></a>
            )}
            {settings?.socialLinks?.youtube && (
              <a href={settings.socialLinks.youtube} target="_blank" rel="noreferrer" style={socialIconStyle}><FiYoutube size={16} /></a>
            )}
            {settings?.socialLinks?.whatsapp && (
              <a href={settings.socialLinks.whatsapp} target="_blank" rel="noreferrer" style={socialIconStyle}><FiMessageCircle size={16} /></a>
            )}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#f3e9cf', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 400, letterSpacing: '0.05em' }}>Shop</h4>
          <FooterLink to="/shop">Shop All</FooterLink>
          <FooterLink to="/shop?productType=bags">Bags</FooterLink>
          <FooterLink to="/shop?productType=jerkins">Jerkins</FooterLink>
          <FooterLink to="/shop?productType=trolleys">Trolleys</FooterLink>
          <FooterLink to="/track-order">Track Order</FooterLink>
        </div>

        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#f3e9cf', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 400, letterSpacing: '0.05em' }}>Policies</h4>
          <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
          <FooterLink to="/shipping-delivery">Shipping &amp; Delivery</FooterLink>
          <FooterLink to="/refund-cancellation">Refund &amp; Cancellation</FooterLink>
          <FooterLink to="/terms-conditions">Terms &amp; Conditions</FooterLink>
          <FooterLink to="/contactus">Contact Us</FooterLink>
        </div>

        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#f3e9cf', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 400, letterSpacing: '0.05em' }}>Contact</h4>
          <p style={{ color: '#c9bd9c', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{settings?.storeEmail}</p>
          <p style={{ color: '#c9bd9c', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{settings?.storePhone}</p>
          <p style={{ color: '#c9bd9c', fontSize: '0.85rem' }}>{settings?.storeAddress}</p>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(212,175,55,0.15)', padding: '1.25rem 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap'
      }}>
        <span style={{ color: '#9c8f6f', fontSize: '0.78rem' }}>
          © {new Date().getFullYear()} {settings?.storeName || '5Star'}. All rights reserved.
        </span>
        <span style={{ color: '#9c8f6f', fontSize: '0.78rem' }}>Secure Payments by Razorpay</span>
        <span style={{ color: '#9c8f6f', fontSize: '0.78rem' }}>
          Powered by{' '}
          <a
            href="https://thesolocompiler.com" target="_blank" rel="noopener noreferrer"
            title="Want a website like this? Get in touch."
            style={{ color: '#d4af37', textDecoration: 'none' }}
          >
            thesolocompiler.com
          </a>
        </span>
      </div>
    </footer>
  );
};

const socialIconStyle = {
  width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.25)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', textDecoration: 'none'
};

const FooterLink = ({ to, children }) => (
  <Link to={to} style={{ display: 'block', color: '#c9bd9c', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '0.6rem' }}>
    {children}
  </Link>
);

export default Footer;
