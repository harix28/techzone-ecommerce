import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiEye } from 'react-icons/fi';
import API from '../../utils/api';
import { getOrderDisplayNumber, getOrderStatus, getOrderTotal } from '../../utils/orders';

const STATUS_STYLES = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my').then(r => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="skeleton h-64 rounded-xl" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 card">
          <FiPackage size={64} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary inline-block">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const orderStatus = getOrderStatus(order);

            return (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-gray-900">Order #{getOrderDisplayNumber(order)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={STATUS_STYLES[orderStatus] || 'badge-gray'}>
                    {orderStatus.toUpperCase()}
                  </span>
                  <span className="font-bold text-gray-900">${getOrderTotal(order).toFixed(2)}</span>
                  <Link to={`/orders/${order._id}`} className="btn-secondary text-sm py-1.5 flex items-center gap-1">
                    <FiEye size={14} /> View
                  </Link>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {order.items?.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl p-2 pr-4">
                    <img src={item.image || `https://picsum.photos/seed/${item.product}/50/50`} alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${i}/50/50`; }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate max-w-32">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity} • ${item.price}</p>
                    </div>
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-medium text-gray-500">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
