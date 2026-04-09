import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductHref, getProductImage } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

export default function StoreWishlistPage() {
  const { items, loading, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card overflow-hidden rounded-[28px]">
              <div className="aspect-[1.1] skeleton" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-24 rounded-full skeleton" />
                <div className="h-5 rounded-full skeleton" />
                <div className="h-5 w-3/4 rounded-full skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <FiHeart size={30} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Your wishlist is empty
        </h1>
        <p className="mt-4 text-slate-500">
          Save products here to compare them later or move them into your cart when you are ready.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/products"
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Browse products
          </Link>
          <Link
            to="/products?featured=true"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View featured
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
          Saved products
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Wishlist
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {items.length} products saved for later.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Keep browsing
            <FiArrowRight />
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.productId} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <Link to={getProductHref(item)} className="block bg-slate-50">
              <img
                src={getProductImage(item, 'wishlist')}
                alt={item.name}
                className="aspect-[1.05] h-full w-full object-cover"
              />
            </Link>
            <div className="space-y-4 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.brand}</p>
                <Link to={getProductHref(item)}>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 transition hover:text-blue-700">
                    {item.name}
                  </h2>
                </Link>
                <p className="mt-2 text-sm text-slate-500">
                  {item.stockQuantity > 0
                    ? `${item.stockQuantity} in stock`
                    : 'Currently out of stock'}
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-950">{formatCurrency(item.price)}</p>
                  {item.compareAtPrice ? (
                    <p className="text-sm text-slate-400 line-through">
                      {formatCurrency(item.compareAtPrice)}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                  {item.ratingAverage.toFixed(1)} / 5
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => addItem(item, 1)}
                  disabled={item.stockQuantity <= 0}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  <FiShoppingCart />
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(item.productId)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <FiTrash2 />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
