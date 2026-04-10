import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductHref, getProductId, getProductImage, isLowStock } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';
import RatingStars from './RatingStars';

export default function ProductCard({ product, layout = 'grid' }) {
  const { addItem } = useCart();
  const { hasItem, toggleWishlist } = useWishlist();

  const productId = getProductId(product);
  const imageUrl = getProductImage(product, 'product-card');
  const href = getProductHref(product);
  const compareAtPrice = Number(product.compareAtPrice || 0);
  const discount =
    compareAtPrice > Number(product.price || 0)
      ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100)
      : 0;
  const outOfStock = Number(product.stockQuantity || 0) <= 0;
  const saved = hasItem(productId);
  const isList = layout === 'list';

  return (
    <article
      className={`card product-card group overflow-hidden ${
        isList ? 'grid gap-0 md:grid-cols-[240px_1fr]' : 'flex h-full flex-col'
      }`}
    >
      <div className="relative overflow-hidden bg-[#f7f9fc]">
        <Link to={href} className="block h-full">
          <div className={isList ? 'h-full min-h-[220px]' : 'aspect-square'}>
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105 sm:p-6"
              onError={(event) => {
                event.target.src = `https://picsum.photos/seed/fallback-${productId}/800/800`;
              }}
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            {discount > 0 ? (
              <span className="rounded-md bg-[#fff1df] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a4b00]">
                {discount}% off
              </span>
            ) : null}
            {product.isFeatured ? (
              <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2874f0] shadow-sm">
                Featured
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(productId)}
            className={`pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border transition ${
              saved
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-slate-200 bg-white text-slate-600 hover:text-rose-600'
            }`}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <FiHeart className={saved ? 'fill-current' : ''} />
          </button>
        </div>

        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/38">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              Out of stock
            </span>
          </div>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${isList ? 'p-5 md:p-6' : 'p-4 sm:p-5'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span>{product.brand}</span>
          {product.category?.name ? <span>{product.category.name}</span> : null}
        </div>

        <div className="mt-3 space-y-2.5">
          <Link to={href}>
            <h3 className={`${isList ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} font-bold leading-snug text-slate-950 transition group-hover:text-[#2874f0]`}>
              {product.name}
            </h3>
          </Link>
          <p className={`${isList ? 'max-w-2xl' : ''} text-sm leading-6 text-slate-600`}>
            {product.shortDescription || product.description}
          </p>
          <RatingStars
            rating={product.ratingAverage || 0}
            count={product.ratingCount || 0}
            className="text-sm"
          />
        </div>

        <div className={`mt-4 flex flex-wrap items-center gap-2 ${isList ? 'order-last mt-5' : ''}`}>
          {isLowStock(product) ? (
            <span className="rounded-md bg-[#fff1df] px-2.5 py-1.5 text-xs font-semibold text-[#9a4b00]">
              Only {product.stockQuantity} left
            </span>
          ) : (
            <span className="rounded-md bg-[#e9f8ee] px-2.5 py-1.5 text-xs font-semibold text-[#167c3b]">
              {outOfStock ? 'Back soon' : 'Ready to ship'}
            </span>
          )}
          {!outOfStock && product.stockQuantity ? (
            <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
              {product.stockQuantity} in stock
            </span>
          ) : null}
        </div>

        <div className={`mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4 ${isList ? 'mt-auto' : ''}`}>
          <div>
            <div className="text-2xl font-extrabold text-slate-950">{formatCurrency(product.price)}</div>
            {compareAtPrice ? (
              <div className="mt-1 text-sm text-slate-400 line-through">{formatCurrency(compareAtPrice)}</div>
            ) : null}
          </div>

          <div className={`flex flex-wrap gap-2 ${isList ? '' : 'w-full sm:w-auto'}`}>
            <button
              type="button"
              onClick={() => addItem(product, 1)}
              disabled={outOfStock}
              className={`btn-primary ${isList ? 'h-11 px-4' : 'h-11 flex-1 justify-center px-4'} disabled:bg-slate-200 disabled:text-slate-500`}
            >
              <FiShoppingCart />
              Add to cart
            </button>
            <Link to={href} className={`${isList ? 'btn-secondary h-11 px-4' : 'btn-secondary h-11 w-full justify-center px-4 sm:w-auto'}`}>
              {isList ? 'View details' : 'View'}
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
