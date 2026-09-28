import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl, handleImageError } from '../utils/api';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const hasVariants = product.variants?.length > 0;
  const outOfStock = hasVariants
    ? product.variants.every((v) => v.stock <= 0)
    : product.stock <= 0;

  const priceRange = hasVariants
    ? [...new Set(product.variants.map((v) => v.price))].sort((a, b) => a - b)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    if (hasVariants) {
      navigate(`/product/${product._id}`);
      return;
    }
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link to={`/product/${product._id}`} className="card fade-in product-card" style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: 'var(--black-surface)' }}>
        <img
          src={getImageUrl(product.images?.[0])}
          onError={handleImageError}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        />
        <div className="product-card-badges" style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">{product.productType}</span>
          {product.featured && <span className="badge badge-info">Featured</span>}
        </div>
        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(40,32,15,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="badge badge-danger">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="product-card-body" style={{ padding: '1rem' }}>
        <div className="product-card-meta" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          {product.brand} · {product.category?.replace(/-/g, ' ')}
        </div>
        <h3 className="product-card-name" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.3rem', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: 0 }}>
          {product.name}
        </h3>
        <div className="product-card-sku" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          SKU: {product.sku}
        </div>
        <div className="product-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div className="product-card-price">
            {hasVariants ? (
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
                {priceRange.length > 1 ? `₹${priceRange[0]} – ₹${priceRange[priceRange.length - 1]}` : `₹${priceRange[0]}`}
              </span>
            ) : (
              <>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{product.price}</span>
                {product.mrp > product.price && (
                  <span style={{ marginLeft: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{product.mrp}
                  </span>
                )}
              </>
            )}
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={outOfStock} style={{ flexShrink: 0 }}>
            {hasVariants ? 'Select' : 'Add'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .product-card-body { padding: 0.7rem !important; }
          .product-card-meta { font-size: 0.6rem !important; margin-bottom: 0.15rem !important; }
          .product-card-name {
            font-size: 0.82rem !important; margin-bottom: 0.2rem !important;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          }
          .product-card-sku { display: none; }
          .product-card-footer { flex-direction: column; align-items: flex-start !important; gap: 0.5rem; }
          .product-card-price span { font-size: 0.92rem !important; }
          .product-card-footer .btn { width: 100%; padding: 0.4rem 0.6rem; font-size: 0.7rem; }
          .product-card-badges .badge { font-size: 0.56rem; padding: 0.12rem 0.4rem; }
        }
      `}</style>
    </Link>
  );
};

export default ProductCard;
