import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import { FiSearch, FiPrinter, FiTrash2, FiX, FiRefreshCw } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_OPTIONS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'failed', 'refunded'];

const PackingSlip = React.forwardRef(({ orders }, ref) => (
  <div ref={ref} className="print-slip">
    {orders.map((o) => (
      <div key={o._id} style={{ pageBreakAfter: 'always', padding: '20px' }}>
        <h2>5STAR — Packing Slip</h2>
        <div className="slip-row"><span className="slip-label">Order ID</span><span>#{o.orderId}</span></div>
        <div className="slip-row"><span className="slip-label">Date</span><span>{new Date(o.createdAt).toLocaleDateString()}</span></div>
        <div className="slip-row"><span className="slip-label">Customer</span><span>{o.customerInfo.name}</span></div>
        <div className="slip-row"><span className="slip-label">Phone</span><span>{o.customerInfo.phone}</span></div>
        <div className="slip-row"><span className="slip-label">Address</span><span>{o.customerInfo.address}, {o.customerInfo.city}, {o.customerInfo.state} - {o.customerInfo.pincode}</span></div>
        <div style={{ margin: '12px 0' }}>
          {o.items.map((item, i) => (
            <div key={i} className="slip-row">
              <span className="slip-label">{item.name}{item.variantLabel ? ` — ${item.variantLabel}` : ''} ({item.sku})</span>
              <span>× {item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="slip-row"><span className="slip-label">Total</span><span>₹{o.total}</span></div>
        <div className="slip-row"><span className="slip-label">Payment</span><span>{o.paymentMethod.toUpperCase()}</span></div>
        <p style={{ marginTop: '20px', fontSize: '11px' }}>Support: support@fivestar.example.com</p>
      </div>
    ))}
  </div>
));

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [printOrders, setPrintOrders] = useState([]);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    api.get('/api/orders', { params }).then(({ data }) => {
      setOrders(data.orders);
      setPages(data.pages);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter, search]);

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const printSelected = () => {
    setPrintOrders(orders.filter((o) => selected.includes(o._id)));
    setTimeout(handlePrint, 100);
  };

  const printSingle = (order) => {
    setPrintOrders([order]);
    setTimeout(handlePrint, 100);
  };

  const updateStatus = async (id, field, value) => {
    try {
      await api.put(`/api/orders/${id}/status`, { [field]: value });
      toast.success('Order updated');
      load();
      if (activeOrder?._id === id) setActiveOrder({ ...activeOrder, [field]: value });
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    await api.delete(`/api/orders/${id}`);
    toast.success('Order deleted');
    setActiveOrder(null);
    load();
  };

  const resetAll = async () => {
    if (!window.confirm('This will permanently delete ALL orders. Continue?')) return;
    await api.delete('/api/orders/reset-all');
    toast.success('All orders reset');
    load();
  };

  if (loading && orders.length === 0) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Orders</h1>
        <div className="admin-actions">
          {selected.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={printSelected}><FiPrinter style={{ marginRight: '0.3rem' }} /> Print Selected ({selected.length})</button>
          )}
          <button className="btn btn-danger btn-sm" onClick={resetAll}><FiRefreshCw style={{ marginRight: '0.3rem' }} /> Reset All Orders</button>
        </div>
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-control" style={{ paddingLeft: '2.4rem' }} placeholder="Search by order ID, name, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-control" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th></th><th>Order ID</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td data-label="Select"><input type="checkbox" checked={selected.includes(o._id)} onChange={() => toggleSelect(o._id)} /></td>
                  <td data-label="Order ID" style={{ cursor: 'pointer', color: 'var(--gold-dark)' }} onClick={() => setActiveOrder(o)}>#{o.orderId}</td>
                  <td data-label="Customer">{o.customerInfo?.name}</td>
                  <td data-label="Status"><span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>{o.orderStatus}</span></td>
                  <td data-label="Payment"><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{o.paymentStatus}</span></td>
                  <td data-label="Total">₹{o.total}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => printSingle(o)}><FiPrinter size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(o._id)} style={{ marginLeft: '0.3rem' }}><FiTrash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="admin-pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={n === page ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>{n}</button>
            ))}
          </div>
        )}
      </div>

      {activeOrder && (
        <div className="modal-overlay" onClick={() => setActiveOrder(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Order #{activeOrder.orderId}</div>
              <button className="modal-close" onClick={() => setActiveOrder(null)}><FiX size={20} /></button>
            </div>
            <div className="input-row input-row-2" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Order Status</label>
                <select className="form-control" value={activeOrder.orderStatus} onChange={(e) => updateStatus(activeOrder._id, 'orderStatus', e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select className="form-control" value={activeOrder.paymentStatus} onChange={(e) => updateStatus(activeOrder._id, 'paymentStatus', e.target.value)}>
                  {PAYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              <p><strong>{activeOrder.customerInfo.name}</strong> · {activeOrder.customerInfo.phone}</p>
              <p>{activeOrder.customerInfo.address}, {activeOrder.customerInfo.city}, {activeOrder.customerInfo.state} - {activeOrder.customerInfo.pincode}</p>
            </div>
            {activeOrder.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                <span>{item.name}{item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}</span>
                <span style={{ flexShrink: 0 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '0.75rem', color: 'var(--gold-dark)' }}>
              <span>Total</span><span>₹{activeOrder.total}</span>
            </div>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => printSingle(activeOrder)}>
              <FiPrinter style={{ marginRight: '0.4rem' }} /> Print Packing Slip
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'none' }}>
        <PackingSlip ref={printRef} orders={printOrders} />
      </div>
    </div>
  );
};

export default AdminOrders;
