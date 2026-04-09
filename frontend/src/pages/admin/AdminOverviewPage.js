import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiDollarSign, FiPackage, FiShoppingBag, FiUsers } from 'react-icons/fi';
import API, { extractApiData } from '../../utils/api';
import { formatCurrency } from '../../utils/format';

export default function AdminOverviewPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard')
      .then((response) => setDashboard(extractApiData(response)))
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(
    () =>
      (dashboard?.monthlyRevenue || []).map((item) => ({
        month: item.monthKey,
        revenue: item.revenue,
        orders: item.orders,
      })),
    [dashboard],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 rounded-[32px] skeleton" />
          ))}
        </div>
        <div className="h-80 rounded-[32px] skeleton" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700">
        Unable to load dashboard metrics.
      </div>
    );
  }

  const statCards = [
    {
      label: 'Revenue',
      value: formatCurrency(dashboard.stats.totalRevenue),
      icon: FiDollarSign,
      accent: 'bg-emerald-100 text-emerald-700',
      detail: `${dashboard.stats.pendingOrders} orders still pending`,
    },
    {
      label: 'Orders',
      value: dashboard.stats.totalOrders,
      icon: FiShoppingBag,
      accent: 'bg-blue-100 text-blue-700',
      detail: `${dashboard.recentOrders.length} recent orders loaded`,
    },
    {
      label: 'Products',
      value: dashboard.stats.totalProducts,
      icon: FiPackage,
      accent: 'bg-violet-100 text-violet-700',
      detail: `${dashboard.stats.lowStockProducts} low stock alerts`,
    },
    {
      label: 'Customers',
      value: dashboard.stats.totalUsers,
      icon: FiUsers,
      accent: 'bg-amber-100 text-amber-700',
      detail: `${dashboard.stats.outOfStock} products are out of stock`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, accent, detail }) => (
          <div key={label} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`inline-flex rounded-2xl p-3 ${accent}`}>
              <Icon />
            </div>
            <p className="mt-5 text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {value}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-sm text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Revenue trend
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Rolling view of paid order volume across seeded data.
              </p>
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#0f172a" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Low stock
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Products at or below threshold.
                </p>
              </div>
              <Link to="/admin/products" className="text-sm font-semibold text-blue-700">
                Manage
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {(dashboard.lowStockProducts || []).map((product) => (
                <div key={product.id} className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">SKU {product.sku}</p>
                  <p className="mt-2 text-sm font-medium text-amber-700">
                    {product.stockQuantity} units left
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Top products
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Best-selling items in the demo catalog.
                </p>
              </div>
              <Link to="/admin/products" className="text-sm font-semibold text-blue-700">
                View all
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {(dashboard.topProducts || []).map((product) => (
                <div key={product.id} className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                    <span>{product.soldCount} sold</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Recent orders
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Latest customer activity across the store.
            </p>
          </div>
          <Link to="/admin/orders" className="text-sm font-semibold text-blue-700">
            See all orders
          </Link>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {(dashboard.recentOrders || []).map((order) => (
            <div key={order.id} className="rounded-[32px] border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Order</p>
                  <p className="mt-2 text-xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {order.orderNumber}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {order.customer?.name} / {order.customer?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-950">{formatCurrency(order.totalAmount)}</p>
                  <p className="mt-2 text-sm text-slate-500">{order.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
