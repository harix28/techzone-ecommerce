import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import API from '../../utils/api';
import { getOrderDisplayNumber, getOrderStatus, getOrderTotal } from '../../utils/orders';

const STATUS_COLORS = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger'
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
      </div>
      <div className="h-64 skeleton rounded-xl" />
    </div>
  );

  if (!data) return <p>Failed to load dashboard</p>;

  const { stats, monthlyRevenue, recentOrders, topProducts, orderStatusBreakdown } = data;

  const chartData = monthlyRevenue.map(m => ({
    month: MONTHS[(m._id.month || 1) - 1],
    revenue: Math.round(m.revenue),
    orders: m.count
  }));

  const STAT_CARDS = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue?.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: FiDollarSign, color: 'bg-green-50 text-green-600', change: '+12%' },
    { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingBag, color: 'bg-blue-50 text-blue-600', sub: `${stats.pendingOrders} pending` },
    { label: 'Products', value: stats.totalProducts, icon: FiPackage, color: 'bg-purple-50 text-purple-600', sub: `${stats.outOfStock} out of stock` },
    { label: 'Customers', value: stats.totalUsers, icon: FiUsers, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(stats.lowStockProducts > 0 || stats.outOfStock > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <FiAlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">Inventory Alert</p>
            <p className="text-amber-700">
              {stats.lowStockProducts > 0 && `${stats.lowStockProducts} products with low stock. `}
              {stats.outOfStock > 0 && `${stats.outOfStock} products out of stock.`}
              {' '}<Link to="/admin/products" className="underline font-medium">Manage inventory →</Link>
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, sub, change }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
              {change && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{change}</span>}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Revenue Overview (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-3">
            {orderStatusBreakdown.map(({ _id, count }) => (
              <div key={_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge ${STATUS_COLORS[_id] || 'badge-gray'}`}>{_id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(count / stats.totalOrders) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.slice(0, 8).map(order => (
              <div key={order._id} className="flex items-center gap-4 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">#{getOrderDisplayNumber(order)}</p>
                  <p className="text-xs text-gray-500">{order.user?.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[getOrderStatus(order)] || 'badge-gray'} text-xs`}>
                  {getOrderStatus(order)}
                </span>
                <p className="text-sm font-bold text-gray-900 flex-shrink-0">${getOrderTotal(order).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Top Products</h2>
            <Link to="/admin/products" className="text-sm text-blue-600 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {topProducts.map((product, i) => (
              <div key={product._id} className="flex items-center gap-3 px-6 py-3">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                  {i + 1}
                </span>
                <img src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/40/40`} alt={product.name}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${i}/40/40`; }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.sold} sold</p>
                </div>
                <p className="text-sm font-bold text-gray-700 flex-shrink-0">${product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
