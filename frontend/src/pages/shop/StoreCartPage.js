import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiShield,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
} from 'react-icons/fi';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import EmptyState from '../../components/ui/EmptyState';
import SectionHeading from '../../components/ui/SectionHeading';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';
import { getProductHref, getProductImage } from '../../utils/catalog';

export default function StoreCartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  if (!items.length) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState
            icon={FiShoppingBag}
            title="Your cart is empty"
            description="Start building a basket with high-intent products, then come back here for a cleaner summary, transparent pricing, and a faster route into checkout."
            action={
              <Link to="/products" className="btn-primary">
                Start shopping
              </Link>
            }
            secondaryAction={
              <Link to="/products?featured=true" className="btn-secondary">
                Shop featured
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const shipping = total >= 99 ? 0 : 9.99;
  const tax = Number((total * 0.08).toFixed(2));
  const orderTotal = Number((total + shipping + tax).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountToFreeShipping = Math.max(0, 99 - total);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <SectionHeading
              eyebrow="Shopping cart"
              title="Review your basket before checkout"
              description="A clearer cart reduces hesitation with editable quantities, transparent totals, and trust signals placed right next to the order summary."
              align="start"
            />
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-[26px] bg-[rgba(15,23,42,0.04)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Items</p>
                <p className="mt-3 text-2xl font-bold text-slate-950">{itemCount}</p>
                <p className="mt-1 text-sm text-slate-500">Products ready to purchase.</p>
              </div>
              <div className="rounded-[26px] bg-[rgba(15,23,42,0.04)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Subtotal</p>
                <p className="mt-3 text-2xl font-bold text-slate-950">{formatCurrency(total)}</p>
                <p className="mt-1 text-sm text-slate-500">Taxes and shipping shown separately.</p>
              </div>
              <div className="rounded-[26px] bg-[rgba(15,23,42,0.04)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Checkout</p>
                <p className="mt-3 text-base font-semibold text-slate-950">Ready when you are</p>
                <p className="mt-1 text-sm text-slate-500">Guest and account checkout both stay low-friction.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {items.map((item) => (
            <div key={item.productId} className="panel rounded-[32px] p-5">
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
                  <Link to={getProductHref(item)} className="mt-2 block text-lg font-semibold text-slate-950 transition hover:text-teal-700">
                    {item.name}
                  </Link>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.stockQuantity} available / item total {formatCurrency(item.lineTotal)}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    <FiTruck size={12} />
                    Ships with tracked delivery
                  </div>
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
              className="btn-ghost border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Clear cart
            </button>
          </div>

          <div>
            <div className="panel sticky top-28 rounded-[32px] p-6">
            <p className="section-kicker">Order summary</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Transparent totals before payment
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
                Add {formatCurrency(amountToFreeShipping)} more to qualify for free shipping.
              </div>
            ) : null}

            <Link
              to="/checkout"
              className="btn-primary mt-6 h-12 w-full justify-center"
            >
              Continue to checkout
              <FiArrowRight />
            </Link>
            <Link
              to="/products"
              className="btn-secondary mt-3 h-12 w-full justify-center"
            >
              Continue shopping
            </Link>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[24px] bg-[rgba(15,23,42,0.04)] px-4 py-4 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <FiShield />
                  Protected checkout
                </div>
                <p className="mt-2 leading-7">Trust-building pricing, shipping, and payment details are surfaced before the final step.</p>
              </div>
              <div className="rounded-[24px] bg-[rgba(15,23,42,0.04)] px-4 py-4 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <FiTruck />
                  Delivery clarity
                </div>
                <p className="mt-2 leading-7">Shipping thresholds and totals remain visible so buyers don’t get surprised later.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
