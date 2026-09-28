import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const PRODUCT_TYPES = [
  { value: '', label: 'All Ranges' },
  { value: 'bags', label: 'Bags' },
  { value: 'jerkins', label: 'Jerkins' },
  { value: 'trolleys', label: 'Trolleys' }
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  const productType = searchParams.get('productType') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    api.get('/api/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (productType) params.productType = productType;
    if (category) params.category = category;
    if (search) params.search = search;
    api.get('/api/products', { params }).then(({ data }) => {
      setProducts(data.products);
      setPages(data.pages);
    }).finally(() => setLoading(false));
  }, [productType, category, page, search]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key === 'productType') next.delete('category');
    setSearchParams(next);
    setPage(1);
  };

  const visibleCategories = productType
    ? categories.filter((c) => c.productType === productType)
    : categories;

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Shop</h1>
          <p>Bags, jerkins &amp; trolleys — built to travel</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search by name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={productType} onChange={(e) => updateParam('productType', e.target.value)}>
            {PRODUCT_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="">All Categories</option>
            {visibleCategories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>No products found.</div>
        ) : (
          <>
            <div className="grid-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={n === page ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
