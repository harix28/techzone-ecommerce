import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiPackage, FiTruck } from 'react-icons/fi';
import API, { extractApiData } from '../../utils/api';
import { getProductHref, getProductImage } from '../../utils/catalog';
import { formatCurrency, formatDate } from '../../utils/format';
import {
  getOrderDisplayNumber,
  getOrderPlacedAt,
  getOrderShipping,
  getOrderStatus,
  getOrderSubtotal,
  getOrderTax,
  getOrderTotal,
} from '../../utils/orders';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

export default function StoreOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${id}`)
      .then((response) => setOrder(extractApiData(response)))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-[520px] rounded-[32px] skeleton" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Order not found
        </h1>
        <p className="mt-4 text-slate-500">
          The order could not be loaded or may not belong to your account.
        </p>
        <Link
          to="/orders"
          className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const status = getOrderStatus(order);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950">
        <FiArrowLeft />
        Back to order history
      </Link>

      <div className="mt-6 rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Order number</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {getOrderDisplayNumber(order)}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Placed on {formatDate(getOrderPlacedAt(order))}
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-700'}`}>
              {status}
            </span>
            <p className="mt-4 text-3xl font-bold text-slate-950">{formatCurrency(getOrderTotal(order))}</p>
            <p className="text-sm text-slate-500">
              {order.paymentMethod} / {order.paymentStatus}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {(order.items || []).map((item) => (
              <div key={item.id} className="rounded-[32px] border border-slate-200 p-5">
                <div className="flex gap-4">
                  <Link to={getProductHref({ id: item.productId, slug: item.slug })} className="shrink-0">
                    <img
                      src={getProductImage({ imageUrl: item.imageUrl, productId: item.productId }, 'order-item')}
                      alt={item.productName}
                      className="h-20 w-20 rounded-3xl object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-slate-950">{item.productName}</p>
                    <p className="mt-1 text-sm text-slate-500">SKU {item.sku}</p>
                    <p className="mt-3 text-sm text-slate-500">
                      Quantity {item.quantity} / Unit {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-950">{formatCurrency(item.lineTotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Shipping address
              </h2>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.line1}</p>
                {order.shippingAddress?.line2 ? <p>{order.shippingAddress.line2}</p> : null}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                <p>{order.shippingAddress?.phone}</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Status details
              </h2>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <FiPackage className="mt-0.5 text-blue-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Order status</p>
                    <p className="capitalize">{status}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiTruck className="mt-0.5 text-blue-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Tracking number</p>
                    <p>{order.trackingNumber || 'Available after shipment'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="mt-0.5 text-blue-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Payment</p>
                    <p>{order.paymentMethod} / {order.paymentStatus}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Summary
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(getOrderSubtotal(order))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(getOrderShipping(order))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(getOrderTax(order))}</span>
                </div>
                {order.discountAmount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-semibold text-emerald-700">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-base font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-950">{formatCurrency(getOrderTotal(order))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
