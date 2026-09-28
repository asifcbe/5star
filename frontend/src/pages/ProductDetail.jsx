import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheck } from 'react-icons/fi';
import api, { getImageUrl, handleImageError } from '../utils/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const groupVariants = (variants) => {
  const groups = {};
  variants.forEach((v) => {
    if (!groups[v.name]) groups[v.name] = [];
    groups[v.name].push(v);
  });
  return groups;
};

const SPEC_FIELDS = [
  ['material', 'Material'],
  ['capacity', 'Capacity'],
  ['color', 'Colour'],
  ['dimensions', 'Dimensions'],
  ['weight', 'Weight'],
  ['warranty', 'Warranty']
];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    api.get(`/api/products/${id}`).then(({ data }) => {
      setProduct(data);
      setActiveImg(0);
      setQty(1);
      setSelectedVariant(data.variants?.length ? data.variants[0] : null);
    }).finally(() => setLoading(false));
  }, [id]);

  const variantGroups = useMemo(() => (product?.variants?.length ? groupVariants(product.variants) : null), [product]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!product) return <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>Product not found.</div>;

  const hasVariants = product.variants?.length > 0;
  const activePrice = hasVariants ? selectedVariant?.price : product.price;
  const activeStock = hasVariants ? selectedVariant?.stock : product.stock;
  const outOfStock = !activeStock || activeStock <= 0;
  const images = product.images?.length ? product.images : [null];
  const specs = SPEC_FIELDS.filter(([key]) => product[key]);

  const handleAdd = () => {
    if (outOfStock) return;
    if (hasVariants && !selectedVariant) {
      toast.error('Please select an option first');
      return;
    }
    addItem(product, qty, hasVariants ? selectedVariant : null);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="container" style={{ padding: '3rem 2rem 5rem' }}>
      <div className="grid-2" style={{ gap: '3rem', alignItems: 'flex-start' }}>
        <div>
          <div style={{ aspectRatio: '1/1', background: 'var(--black-surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem' }}>
            <img src={getImageUrl(images[activeImg])} onError={handleImageError} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: 64, height: 64, borderRadius: 'var(--radius)', overflow: 'hidden',
                  border: i === activeImg ? '2px solid var(--gold)' : '1px solid var(--black-border)',
                  padding: 0, cursor: 'pointer', background: 'var(--black-surface)'
                }}>
                  <img src={getImageUrl(img)} onError={handleImageError} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-gold">{product.productType}</span>
            <span className="badge badge-info">{product.category?.replace(/-/g, ' ')}</span>
            {product.featured && <span className="badge badge-warning">Featured</span>}
          </div>
          <h1 style={{ fontSize: '1.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>{product.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Brand: <strong style={{ color: 'var(--text-secondary)' }}>{product.brand}</strong> &nbsp;·&nbsp; SKU: <strong style={{ color: 'var(--text-secondary)' }}>{hasVariants ? (selectedVariant?.sku || product.sku) : product.sku}</strong>
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{activePrice ?? '—'}</span>
            {!hasVariants && product.mrp > product.price && (
              <span style={{ marginLeft: '0.75rem', fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.mrp}</span>
            )}
            {outOfStock ? (
              <div style={{ marginTop: '0.5rem' }}><span className="badge badge-danger">Out of Stock</span></div>
            ) : (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FiCheck size={14} /> In Stock ({activeStock} available)
              </div>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{product.description}</p>

          {hasVariants && Object.entries(variantGroups).map(([groupName, options]) => (
            <div key={groupName} style={{ marginBottom: '1.5rem' }}>
              <div className="form-label">{groupName}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {options.map((v) => {
                  const active = selectedVariant?._id === v._id;
                  const disabled = v.stock <= 0;
                  return (
                    <button
                      key={v._id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedVariant(v)}
                      className={active ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                      style={disabled ? { opacity: 0.4, textDecoration: 'line-through' } : undefined}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {specs.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="form-label">Specifications</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  {specs.map(([key, label]) => (
                    <tr key={key}>
                      <td style={{ padding: '0.4rem 0', color: 'var(--text-muted)', width: '35%' }}>{label}</td>
                      <td style={{ padding: '0.4rem 0', color: 'var(--text-secondary)' }}>{product[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="qty-control">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAdd} disabled={outOfStock} style={{ flex: 1 }}>
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {product.tags.map((t) => <span key={t} className="badge badge-info">{t}</span>)}
            </div>
          )}

          <Link to="/shop" style={{ display: 'inline-block', marginTop: '2rem', color: 'var(--gold-dark)', fontSize: '0.85rem' }}>&larr; Back to Shop</Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
