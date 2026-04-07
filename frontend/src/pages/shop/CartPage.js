import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
        <Link to="/products" className="btn-primary px-8 py-3 inline-block">Start Shopping</Link>
      </div>
    );
  }

  const shipping = total > 99 ? 0 : 9.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <div className="card divide-y divide-gray-100">
            {items.map(item => (
              <div key={item._id} className="flex gap-4 p-4">
                <Link to={`/products/${item._id}`} className="flex-shrink-0">
                  <img
                    src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/100/100`}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl"
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${item._id}/100/100`; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">{item.brand}</p>
                  <Link to={`/products/${item._id}`} className="font-semibold text-sm text-gray-900 hover:text-blue-600 line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-blue-600 font-bold mt-1">${item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => removeItem(item._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <FiTrash2 size={16} />
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => item.quantity === 1 ? removeItem(item._id) : updateQty(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                      <FiMinus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                      <FiPlus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={clearCart} className="btn-secondary text-sm text-red-500 border-red-200 hover:bg-red-50">
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-blue-600">${orderTotal.toFixed(2)}</span>
            </div>

            {shipping > 0 && (
              <p className="text-xs text-gray-500 mb-4 bg-blue-50 rounded-lg p-3">
                💡 Add <strong>${(99 - total).toFixed(2)}</strong> more to get FREE shipping!
              </p>
            )}

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-center">
              Proceed to Checkout <FiArrowRight />
            </Link>
            <Link to="/products" className="btn-secondary w-full mt-3 flex items-center justify-center gap-2 py-2.5 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}