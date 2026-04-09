import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPackage } from 'react-icons/fi';
import API, { extractApiData, extractApiMeta } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { getOrderDisplayNumber, getOrderPlacedAt, getOrderStatus, getOrderTotal } from '../../utils/orders';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my')
      .then((response) => {
        setOrders(extractApiData(response));
        setMeta(extractApiMeta(response));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 rounded-[32px] skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FiPackage size={30} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          No orders yet
        </h1>
        <p className="mt-4 text-slate-500">
          Complete checkout to see your order history here.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Order history
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {meta.total || orders.length} orders across your account.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = getOrderStatus(order);

          return (
            <div key={order.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Order</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {getOrderDisplayNumber(order)}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Placed {formatDate(getOrderPlacedAt(order))}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-700'}`}>
                    {status}
                  </span>
                  <p className="mt-3 text-2xl font-bold text-slate-950">
                    {formatCurrency(getOrderTotal(order))}
                  </p>
                  <p className="text-sm text-slate-500">{order.items?.length || 0} items</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {(order.items || []).slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                    {item.productName} x{item.quantity}
                  </div>
                ))}
                {(order.items || []).length > 3 ? (
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                    +{order.items.length - 3} more
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                  Payment: <span className="font-medium text-slate-700">{order.paymentMethod}</span> / {order.paymentStatus}
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View details
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
