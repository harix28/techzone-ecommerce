import { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { getOrderDisplayNumber, getOrderStatus, getOrderTotal } from '../../utils/orders';

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLES = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const { data } = await API.get(`/orders?${params}`);
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const updateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await API.put(`/orders/${editingOrder._id}/status`, { status: newStatus, trackingNumber });
      toast.success('Order status updated!');
      setEditingOrder(null);
      fetchOrders();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Orders</h1>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Update Order #{getOrderDisplayNumber(editingOrder)}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input bg-white">
                  <option value="">Select status</option>
                  {STATUSES.slice(1).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number (optional)</label>
                <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="input" placeholder="TRK123456" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={updateStatus} disabled={!newStatus || updating} className="btn-primary flex-1 py-2.5">
                {updating ? 'Updating...' : 'Update Status'}
              </button>
              <button onClick={() => setEditingOrder(null)} className="btn-secondary px-6 py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 skeleton rounded" /></td>
                  ))}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900">#{getOrderDisplayNumber(order)}</p>
                    <p className="text-xs text-gray-400 capitalize">{order.paymentMethod} • {order.paymentStatus}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{order.items?.length} items</td>
                  <td className="px-4 py-4 font-bold text-gray-900">${getOrderTotal(order).toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`badge ${STATUS_STYLES[getOrderStatus(order)] || 'badge-gray'} capitalize`}>
                      {getOrderStatus(order)}
                    </span>
                    {order.trackingNumber && <p className="text-xs text-gray-400 mt-0.5">#{order.trackingNumber}</p>}
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <button onClick={() => { setEditingOrder(order); setNewStatus(getOrderStatus(order)); setTrackingNumber(order.trackingNumber || ''); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Update status">
                      <FiEdit size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-50">Prev</button>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-blue-600 text-white' : 'btn-secondary'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
