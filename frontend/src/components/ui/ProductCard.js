import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductHref, getProductId, getProductImage, isLowStock } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

export default function ProductCard({ product }) {
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

  return (
    <div className="card product-card group bg-white">
      <div className="relative">
        <Link to={href} className="block">
          <div className="aspect-square overflow-hidden bg-slate-50">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(event) => {
                event.target.src = `https://picsum.photos/seed/fallback-${productId}/800/800`;
              }}
            />
          </div>
        </Link>

        <button
          type="button"
          onClick={() => toggleWishlist(productId)}
          className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
            saved
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-white/80 bg-white/90 text-slate-600 hover:text-rose-600'
          }`}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <FiHeart className={saved ? 'fill-current' : ''} />
        </button>

        {discount > 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
            Save {discount}%
          </span>
        ) : null}

        {product.isFeatured ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        ) : null}

        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              Out of stock
            </span>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span>{product.brand}</span>
            <span>{product.category?.name}</span>
          </div>
          <Link to={href}>
            <h3 className="text-base font-semibold leading-snug text-slate-900 transition group-hover:text-blue-700">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-1 text-amber-400">
              <FiStar className="fill-current" />
              <span className="font-medium text-slate-700">
                {(product.ratingAverage || 0).toFixed(1)}
              </span>
            </div>
            <span>({product.ratingCount || 0} reviews)</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-slate-900">{formatCurrency(product.price)}</div>
            {compareAtPrice ? (
              <div className="text-sm text-slate-400 line-through">
                {formatCurrency(compareAtPrice)}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => addItem(product, 1)}
            disabled={outOfStock}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <FiShoppingCart />
            Add
          </button>
        </div>

        {isLowStock(product) ? (
          <p className="text-sm font-medium text-amber-700">
            Only {product.stockQuantity} units left in stock.
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            {outOfStock ? 'Back soon' : `${product.stockQuantity} ready to ship`}
          </p>
        )}
      </div>
    </div>
  );
}
