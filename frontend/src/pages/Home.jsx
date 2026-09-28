import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import YouTube from 'react-youtube';
import {
  FiShield, FiTruck, FiAward, FiRefreshCw, FiArrowRight, FiGrid, FiBriefcase, FiPackage
} from 'react-icons/fi';
import {
  GiBackpack, GiDuffelBag, GiLabCoat, GiPoncho, GiWinterHat, GiSuitcase, GiTravelDress, GiClothes
} from 'react-icons/gi';
import { LuLuggage } from 'react-icons/lu';
import api, { getImageUrl, handleImageError } from '../utils/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import TravelScene from '../components/TravelScene';

const CATEGORY_ICONS = {
  backpacks: <GiBackpack size={28} />,
  'laptop-bags': <FiBriefcase size={26} />,
  'duffel-bags': <GiDuffelBag size={28} />,
  'leather-style-jerkins': <GiLabCoat size={28} />,
  'rainproof-jerkins': <GiPoncho size={28} />,
  'winter-jerkins': <GiWinterHat size={28} />,
  'cabin-trolleys': <GiSuitcase size={28} />,
  'medium-trolleys': <LuLuggage size={26} />,
  'large-trolleys': <GiTravelDress size={28} />
};
const categoryIcon = (slug) => CATEGORY_ICONS[slug] || <FiGrid size={28} />;

const TYPE_TILES = [
  { type: 'bags', label: 'Bags', icon: <GiBackpack size={30} />, blurb: 'Backpacks, laptop bags & duffels' },
  { type: 'jerkins', label: 'Jerkins', icon: <GiClothes size={30} />, blurb: 'Leather-style, rainproof & winter' },
  { type: 'trolleys', label: 'Trolleys', icon: <GiSuitcase size={30} />, blurb: 'Cabin, medium & large luggage' }
];

const VALUE_PROPS = [
  { icon: <FiShield size={26} />, title: 'Built to Travel', text: 'Reinforced seams, YKK-grade zips and impact-tested shells — made to survive the baggage belt and the years after it.' },
  { icon: <FiTruck size={26} />, title: 'Fast, Tracked Shipping', text: 'Orders are dispatched quickly and can be tracked from your account or via Track Order.' },
  { icon: <FiAward size={26} />, title: 'Warranty on Every Piece', text: 'From 1 year on jerkins to 10 years on flagship trolleys — every product ships with a real warranty.' },
  { icon: <FiRefreshCw size={26} />, title: 'Easy 7-Day Returns', text: 'Changed your mind? Return unused items in their original packaging within 7 days.' }
];

const Home = () => {
  const [landing, setLanding] = useState(null);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/landing'),
      api.get('/api/products?featured=true&limit=8'),
      api.get('/api/branches'),
      api.get('/api/categories'),
      api.get('/api/products/category-counts')
    ]).then(([landingRes, productsRes, branchesRes, categoriesRes, countsRes]) => {
      setLanding(landingRes.data);
      setProducts(productsRes.data.products || []);
      setBranches(branchesRes.data || []);
      setCategories(categoriesRes.data || []);
      setCategoryCounts(countsRes.data || {});
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const carouselImages = landing?.carouselImages || [];
  const categoriesWithProducts = categories.filter((c) => categoryCounts[c.slug] > 0);

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'var(--black-surface)' }}>
        {carouselImages.length > 0 && (
          <Slider dots infinite autoplay autoplaySpeed={5000} speed={800} slidesToShow={1} slidesToScroll={1} arrows={false}
            style={{ position: 'absolute', inset: 0 }}>
            {carouselImages.map((img, i) => (
              <div key={i} style={{ position: 'relative', height: '80vh' }}>
                <img src={getImageUrl(img.url)} onError={handleImageError} alt={img.alt || '5Star'} style={{ width: '100%', height: '80vh', objectFit: 'cover' }} />
                {/* Very light wash — just enough for a consistent tone, keeps the product image clearly visible */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(34,28,18,0.04) 0%, rgba(34,28,18,0.10) 60%, rgba(34,28,18,0.22) 100%)' }} />
              </div>
            ))}
          </Slider>
        )}

        {/* Focused scrim behind the copy only, so white text stays legible without dimming the image */}
        {carouselImages.length > 0 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 60% at 50% 52%, rgba(28,22,12,0.55) 0%, rgba(28,22,12,0.28) 45%, transparent 75%)'
          }} />
        )}

        <div className="container fade-in-up" style={{ position: 'relative', textAlign: 'center', zIndex: 2 }}>
          <div className="section-label" style={{ color: 'var(--gold-bright)', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>Bags · Jerkins · Trolleys</div>
          <h1 style={{
            fontSize: 'clamp(2.6rem,7vw,5rem)', color: '#ffffff', marginBottom: '1rem',
            textShadow: '0 2px 24px rgba(0,0,0,0.6)', fontFamily: 'var(--font-display)', letterSpacing: '0.02em'
          }}>
            {landing?.heroTitle || '5Star'}
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2vw,1.35rem)', color: '#f6efe0', maxWidth: 620, margin: '0 auto 2rem', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
            {landing?.heroSubtitle || 'Bags, Jerkins & Trolleys — Built to Travel.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Link to="/shop?productType=trolleys" className="btn btn-lg" style={{ background: '#ffffff', color: 'var(--gold-dark)', fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>Shop Trolleys</Link>
            <Link to="/shop?productType=bags" className="btn btn-outline btn-lg" style={{ borderColor: '#ffffff', color: '#ffffff', background: 'rgba(34,28,18,0.28)' }}>Shop Bags</Link>
          </div>
          <div>
            <Link to="/shop" className="btn btn-primary btn-lg" style={{ minWidth: 220 }}>Shop All</Link>
          </div>
        </div>
      </section>

      {/* ANIMATED TRAVEL SCENE STRIP */}
      <section style={{
        borderTop: '1px solid var(--black-border)',
        borderBottom: '1px solid var(--black-border)'
      }}>
        <TravelScene />
      </section>

      {/* SHOP BY FAMILY */}
      <section className="section">
        <div className="container">
          <div className="section-label" style={{ textAlign: 'center' }}>Three Ranges</div>
          <h2 className="section-title">What Are You Packing For?</h2>
          <div className="gold-divider" />
          <div className="grid-3">
            {TYPE_TILES.map((t) => (
              <Link key={t.type} to={`/shop?productType=${t.type}`} className="card fade-in" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                padding: '2.5rem 1.5rem', textDecoration: 'none', gap: '0.75rem'
              }}>
                <div style={{
                  width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--gold-dark)'
                }}>{t.icon}</div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 400 }}>{t.label}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.blurb}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Explore <FiArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      {categoriesWithProducts.length > 0 && (
        <section className="section section-dark">
          <div className="container">
            <div className="section-label" style={{ textAlign: 'center' }}>Browse</div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Jump straight to the pieces you need</p>
            <div className="category-grid">
              {categoriesWithProducts.map((c) => (
                <Link
                  key={c._id}
                  to={`/shop?category=${encodeURIComponent(c.slug)}`}
                  className="card fade-in category-box"
                >
                  <div className="category-box-icon">
                    {categoryIcon(c.slug)}
                  </div>
                  <h3 className="category-box-name">{c.name}</h3>
                  <span className="category-box-count">
                    {categoryCounts[c.slug]} product{categoryCounts[c.slug] === 1 ? '' : 's'}
                  </span>
                  <span className="category-box-cta">
                    Shop Now <FiArrowRight size={13} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <style>{`
            .category-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1.5rem;
            }
            .category-box {
              display: flex; flex-direction: column; align-items: center; text-align: center;
              padding: 2rem 1.25rem; text-decoration: none; gap: 0.85rem;
            }
            .category-box-icon {
              width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
              background: rgba(var(--accent-rgb),0.1); color: var(--gold-dark);
            }
            .category-box-name { font-size: 1rem; color: var(--text-primary); margin: 0; font-family: var(--font-body); font-weight: 600; }
            .category-box-count { font-size: 0.78rem; color: var(--text-muted); }
            .category-box-cta {
              display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.78rem;
              font-weight: 600; color: var(--gold-dark); text-transform: uppercase; letter-spacing: 0.05em;
            }
            @media (max-width: 900px) {
              .category-grid { grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
              .category-box { padding: 1rem 0.5rem; gap: 0.4rem; border-radius: var(--radius); }
              .category-box-icon { width: 40px; height: 40px; }
              .category-box-icon svg { width: 18px; height: 18px; }
              .category-box-name { font-size: 0.74rem; line-height: 1.2; }
              .category-box-count { font-size: 0.62rem; }
              .category-box-cta { font-size: 0.6rem; gap: 0.2rem; letter-spacing: 0.02em; }
              .category-box-cta svg { width: 10px; height: 10px; }
            }
          `}</style>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {products.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-label" style={{ textAlign: 'center' }}>Handpicked For You</div>
            <h2 className="section-title">Featured Pieces</h2>
            <p className="section-subtitle">Best-sellers across bags, jerkins and trolleys</p>
            <div className="grid-4 featured-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/shop" className="btn btn-outline">View All Products</Link>
            </div>
          </div>

          <style>{`
            @media (max-width: 480px) {
              .featured-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.85rem; }
            }
          `}</style>
        </section>
      )}

      {/* VALUE PROPS */}
      <section className="section section-surface">
        <div className="container">
          <div className="section-label" style={{ textAlign: 'center' }}>Why 5Star</div>
          <h2 className="section-title">Made for the Journey</h2>
          <div className="gold-divider" />
          <div className="grid-4">
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--gold-dark)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{v.icon}</div>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.6rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{v.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      {landing?.historyText && (
        <section className="section">
          <div className="container grid-2" style={{ gap: '3rem', alignItems: 'center' }}>
            <div>
              <div className="section-label">Our Story</div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>
                {landing.historyTitle || 'Crafted for the Journey'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>{landing.historyText}</p>
            </div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--black-surface)', aspectRatio: '4/3' }}>
              <img
                src={getImageUrl(landing.historyImage || landing.carouselImages?.[0]?.url)}
                onError={handleImageError}
                alt={landing.historyTitle || '5Star'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>
      )}

      {/* YOUTUBE */}
      {landing?.youtubeVideoId && (
        <section className="section section-dark">
          <div className="container">
            <div className="section-label" style={{ textAlign: 'center' }}>Watch</div>
            <h2 className="section-title">{landing.youtubeTitle || 'Our Story'}</h2>
            <div className="gold-divider" />
            <div style={{ maxWidth: 900, margin: '0 auto', aspectRatio: '16/9', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <YouTube videoId={landing.youtubeVideoId} opts={{ width: '100%', height: '100%' }} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </section>
      )}

      {/* BRANCHES */}
      {branches.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-label" style={{ textAlign: 'center' }}>Visit Us</div>
            <h2 className="section-title">Our Stores</h2>
            <div className="gold-divider" />
            <div className="grid-3">
              {branches.map((b) => (
                <div key={b._id} className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--gold-dark)', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>{b.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{b.address}</p>
                  {b.timings && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.timings}</p>}
                  {b.phone && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.phone}</p>}
                  {b.isComingSoon && <span className="badge badge-warning" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Coming Soon</span>}
                  {b.googleMapLink && !b.isComingSoon && (
                    <a href={b.googleMapLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem' }}>
                      Get Directions
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#ffffff' }}>Your Next Trip Starts Here</h2>
          <p className="section-subtitle" style={{ color: '#fdf6e6' }}>Browse the full 5Star range of bags, jerkins and trolleys.</p>
          <Link to="/shop" className="btn btn-lg" style={{ background: '#ffffff', color: 'var(--gold-dark)', fontWeight: 700 }}>
            <FiPackage style={{ marginRight: '0.4rem' }} /> Shop All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
