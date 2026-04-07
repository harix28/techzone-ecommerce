import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const image = product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/400`;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="card product-card group">
      <Link to={`/products/${product._id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img src={image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = `https://picsum.photos/seed/${product._id}/400/400`; }}
          />
        </div>
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
            Featured
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-lg text-sm">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{product.brand}</p>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2 hover:text-blue-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <FiStar key={star}
                className={`w-3 h-3 ${star <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.numReviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">${product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">${product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); addItem(product, 1); }}
            disabled={product.stock === 0}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            title="Add to cart"
          >
            <FiShoppingCart size={16} />
          </button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-500 font-medium mt-2">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}