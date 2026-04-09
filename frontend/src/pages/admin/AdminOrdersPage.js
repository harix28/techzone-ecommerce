import { useEffect, useState } from 'react';
import { FiSave, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData, extractApiMeta } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { getOrderDisplayNumber, getOrderStatus, getOrderTotal } from '../../utils/orders';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [nextStatus, setNextStatus] = useState('pending');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders', {
        params: {
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      setOrders(extractApiData(response));
      setMeta(extractApiMeta(response));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, search, statusFilter]);

  const handleUpdateOrder = async () => {
    try {
      await API.put(`/orders/${editingOrder.id}/status`, {
        status: nextStatus,
        trackingNumber,
      });
      toast.success('Order updated successfully.');
      setEditingOrder(null);
      await loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update order.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Orders
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Search and manage customer checkout flow states.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by order number, customer name, or email"
              className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                <th className="pb-4">Order</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Total</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                  </tr>
                ))
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-4">
                      <p className="font-semibold text-slate-900">{getOrderDisplayNumber(order)}</p>
                      <p className="text-sm text-slate-500">{order.paymentMethod} / {order.paymentStatus}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-slate-900">{order.customer?.name}</p>
                      <p className="text-sm text-slate-500">{order.customer?.email}</p>
                    </td>
                    <td className="py-4 text-slate-600">{formatDate(order.createdAt)}</td>
                    <td className="py-4 font-semibold text-slate-900">{formatCurrency(getOrderTotal(order))}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {getOrderStatus(order)}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOrder(order);
                          setTrackingNumber(order.trackingNumber || '');
                          setNextStatus(getOrderStatus(order));
                        }}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
              Previous
            </button>
            {Array.from({ length: meta.totalPages }).map((_, index) => {
              const nextPage = index + 1;

              return (
                <button
                  key={nextPage}
                  type="button"
                  onClick={() => setPage(nextPage)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                    page === nextPage ? 'bg-slate-950 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {nextPage}
                </button>
              );
            })}
            <button type="button" onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))} disabled={page >= meta.totalPages} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
              Next
            </button>
          </div>
        ) : null}
      </div>

      {editingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-[36px] bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Update order {getOrderDisplayNumber(editingOrder)}
            </h3>
            <div className="mt-6 space-y-4">
              <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500">
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Tracking number" className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={handleUpdateOrder} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                <FiSave />
                Save update
              </button>
              <button type="button" onClick={() => setEditingOrder(null)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
