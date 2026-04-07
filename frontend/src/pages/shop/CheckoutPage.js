import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiCheck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    fullName: user?.name || '', phone: '',
    street: '', city: '', state: '', zip: '', country: 'USA'
  });

  const shipping = total > 99 ? 0 : 9.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Cart is empty');
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product: i._id, quantity: i.quantity
      }));
      const { data } = await API.post('/orders', {
        items: orderItems, shippingAddress: address, paymentMethod
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <FiTruck className="text-blue-600" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="input" placeholder="John Doe" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="input" placeholder="+1 234 567 8900" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="input" placeholder="123 Main St" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="input" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="input" placeholder="NY" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input required value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="input" placeholder="10001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input required value={address.country} onChange={e => setAddress({...address, country: e.target.value})} className="input" placeholder="USA" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <FiCreditCard className="text-blue-600" /> Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)} className="hidden" />
                    <span className="text-2xl">{m.icon}</span>
                    <span className="font-medium text-gray-900">{m.label}</span>
                    {paymentMethod === m.id && (
                      <FiCheck className="ml-auto text-blue-600" size={20} />
                    )}
                  </label>
                ))}
              </div>
              {paymentMethod === 'card' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                  💳 Card payment would be processed via Stripe in production. For demo, your order will be placed without actual payment.
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="text-base font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3 text-sm">
                    <img src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/60/60`} alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${item._id}/60/60`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-blue-600">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" disabled={loading || items.length === 0}
                className="btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2">
                {loading ? 'Placing Order...' : `Place Order • $${orderTotal.toFixed(2)}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                🔒 Your information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
