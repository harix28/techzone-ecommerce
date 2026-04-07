import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiClock } from 'react-icons/fi';
import API from '../../utils/api';
import {
  getOrderDisplayNumber,
  getOrderShipping,
  getOrderStatus,
  getOrderSubtotal,
  getOrderTax,
  getOrderTotal
} from '../../utils/orders';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_STYLES = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger'
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${id}`).then(r => { setOrder(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="skeleton h-96 rounded-xl" /></div>;
  if (!order) return <div className="text-center py-20"><p>Order not found</p></div>;

  const orderStatus = getOrderStatus(order);
  const currentStep = STATUS_STEPS.indexOf(orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <FiArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Order #{getOrderDisplayNumber(order)}
          </h1>
          <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className={`badge ${STATUS_STYLES[orderStatus] || 'badge-gray'}`}>
          {orderStatus.toUpperCase()}
        </span>
      </div>

      {/* Progress Tracker */}
      {orderStatus !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Progress</h2>
          <div className="relative">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
              <div className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all"
                style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }} />
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="relative flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {i < currentStep ? <FiCheck size={14} /> : i === currentStep ? <FiClock size={14} /> : <span className="text-xs">{i+1}</span>}
                  </div>
                  <span className="text-xs text-gray-500 capitalize hidden sm:block">{step}</span>
                </div>
              ))}
            </div>
          </div>
          {order.trackingNumber && (
            <p className="text-sm text-gray-600 mt-4 bg-gray-50 rounded-lg p-3">
              📦 Tracking Number: <strong>{order.trackingNumber}</strong>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 card">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Order Items ({order.items?.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-4 p-4">
                <img src={item.image || `https://picsum.photos/seed/${i}/60/60`} alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${i}/60/60`; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                </div>
                <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${getOrderSubtotal(order).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{getOrderShipping(order) === 0 ? 'FREE' : `$${getOrderShipping(order).toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>${getOrderTax(order).toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Total</span><span className="text-blue-600">${getOrderTotal(order).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="text-blue-600">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
            <div className="text-sm">
              <p className="text-gray-600">Method: <strong className="capitalize">{order.paymentMethod}</strong></p>
              <p className="text-gray-600">Status: <span className={`${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'} font-medium capitalize`}>{order.paymentStatus}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
