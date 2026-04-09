import { Link } from 'react-router-dom';
import { FiArrowRight, FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';
import { getProductHref, getProductImage } from '../../utils/catalog';

export default function StoreCartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FiShoppingBag size={30} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Your cart is empty
        </h1>
        <p className="mt-4 text-slate-500">
          Add products to your cart to start the seeded checkout flow.
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

  const shipping = total >= 99 ? 0 : 9.99;
  const tax = Number((total * 0.08).toFixed(2));
  const orderTotal = Number((total + shipping + tax).toFixed(2));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Shopping cart
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {items.reduce((sum, item) => sum + item.quantity, 0)} items ready for checkout.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <Link to={getProductHref(item)} className="shrink-0">
                  <img
                    src={getProductImage(item, 'cart')}
                    alt={item.name}
                    className="h-24 w-24 rounded-3xl object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.brand}</p>
                  <Link to={getProductHref(item)} className="mt-2 block text-lg font-semibold text-slate-950 transition hover:text-blue-700">
                    {item.name}
                  </Link>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.stockQuantity} available / item total {formatCurrency(item.lineTotal)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))}
                        className="inline-flex h-11 w-11 items-center justify-center text-slate-700 transition hover:bg-slate-50"
                      >
                        <FiMinus />
                      </button>
                      <span className="inline-flex min-w-[48px] justify-center text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, Math.min(item.stockQuantity, item.quantity + 1))}
                        className="inline-flex h-11 w-11 items-center justify-center text-slate-700 transition hover:bg-slate-50"
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <FiTrash2 />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Unit price</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">{formatCurrency(item.price)}</p>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={clearCart}
            className="rounded-full border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Clear cart
          </button>
        </div>

        <div>
          <div className="sticky top-28 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Order summary
            </h2>
            <div className="mt-6 space-y-3 border-b border-slate-100 pb-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">Total</span>
              <span className="text-3xl font-bold text-slate-950">{formatCurrency(orderTotal)}</span>
            </div>

            {shipping > 0 ? (
              <div className="mt-6 rounded-3xl bg-blue-50 p-4 text-sm text-blue-700">
                Add {formatCurrency(99 - total)} more to qualify for free shipping.
              </div>
            ) : null}

            <Link
              to="/checkout"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Continue to checkout
              <FiArrowRight />
            </Link>
            <Link
              to="/products"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
