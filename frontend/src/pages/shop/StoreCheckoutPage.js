import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiMapPin, FiPlusCircle, FiShield, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

const PAYMENT_METHODS = [
  { id: 'card', title: 'Credit or debit card', description: 'Demo-ready payment flow' },
  { id: 'upi', title: 'UPI', description: 'Great for local demo flows' },
  { id: 'paypal', title: 'PayPal', description: 'External wallet option' },
  { id: 'cod', title: 'Cash on delivery', description: 'Collected on delivery' },
];

const emptyAddress = (user) => ({
  label: 'Home',
  fullName: user?.name || '',
  phone: user?.phone || '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
});

export default function StoreCheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(() => emptyAddress(user));
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [notes, setNotes] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    API.get('/users/addresses')
      .then((response) => {
        const nextAddresses = extractApiData(response);
        setAddresses(nextAddresses);

        const defaultAddress = nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else {
          setShowNewAddress(true);
        }
      })
      .catch(() => setShowNewAddress(true))
      .finally(() => setLoadingAddresses(false));
  }, []);

  const shipping = useMemo(() => (total >= 99 ? 0 : 9.99), [total]);
  const tax = useMemo(() => Number((total * 0.08).toFixed(2)), [total]);
  const discountAmount = Number(coupon?.discountAmount || 0);
  const grandTotal = Number((total + shipping + tax - discountAmount).toFixed(2));

  const saveNewAddress = async () => {
    const response = await API.post('/users/addresses', addressForm);
    const createdAddress = extractApiData(response);

    setAddresses((current) => {
      const nextAddresses = addressForm.isDefault
        ? current.map((address) => ({ ...address, isDefault: false }))
        : current;

      return [createdAddress, ...nextAddresses];
    });
    setSelectedAddressId(createdAddress.id);
    setShowNewAddress(false);
    setAddressForm(emptyAddress(user));
    return createdAddress.id;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCoupon(null);
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await API.get('/coupons/validate', {
        params: {
          code: couponCode.trim(),
          subtotal: total,
        },
      });
      const validatedCoupon = extractApiData(response);
      setCoupon(validatedCoupon);
      toast.success(`Coupon ${validatedCoupon.code} applied.`);
    } catch (error) {
      setCoupon(null);
      toast.error(error.response?.data?.message || 'Coupon is not valid.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!items.length) {
      toast.error('Your cart is empty.');
      return;
    }

    setPlacingOrder(true);
    try {
      let addressId = selectedAddressId;

      if (!addressId) {
        addressId = await saveNewAddress();
      }

      const response = await API.post('/orders', {
        addressId,
        paymentMethod,
        couponCode: coupon?.code || '',
        notes,
      });

      const createdOrder = extractApiData(response);
      await clearCart();
      toast.success('Order placed successfully.');
      navigate(`/orders/${createdOrder.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!items.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Your cart is empty
        </h1>
        <p className="mt-4 text-slate-500">
          Add some products before moving into checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to cart
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Checkout
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Complete your order with shipping, coupon, and payment details.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Shipping address
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Pick a saved address or add a new one for this order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAddress((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FiPlusCircle />
                {showNewAddress ? 'Hide form' : 'Add new address'}
              </button>
            </div>

            {loadingAddresses ? (
              <div className="mt-6 h-32 rounded-[32px] skeleton" />
            ) : (
              <>
                <div className="mt-6 grid gap-4">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`rounded-[32px] border p-5 text-left transition ${
                        selectedAddressId === address.id
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">
                            {address.label}
                          </p>
                          <p className="mt-2 text-lg font-semibold">{address.fullName}</p>
                        </div>
                        {address.isDefault ? (
                          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm opacity-80">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}
                      </p>
                      <p className="text-sm opacity-80">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm opacity-80">{address.country}</p>
                      <p className="mt-2 text-sm font-medium">{address.phone}</p>
                    </button>
                  ))}
                </div>

                {showNewAddress ? (
                  <div className="mt-6 rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-lg font-semibold text-slate-950">New address</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <input
                        value={addressForm.label}
                        onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
                        placeholder="Label"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                      />
                      <input
                        value={addressForm.fullName}
                        onChange={(event) => setAddressForm((current) => ({ ...current, fullName: event.target.value }))}
                        placeholder="Full name"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                      />
                      <input
                        value={addressForm.phone}
                        onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))}
                        placeholder="Phone"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                      />
                      <input
                        value={addressForm.country}
                        onChange={(event) => setAddressForm((current) => ({ ...current, country: event.target.value }))}
                        placeholder="Country"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                      />
                      <input
                        value={addressForm.line1}
                        onChange={(event) => setAddressForm((current) => ({ ...current, line1: event.target.value }))}
                        placeholder="Address line 1"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 sm:col-span-2"
                      />
                      <input
                        value={addressForm.line2}
                        onChange={(event) => setAddressForm((current) => ({ ...current, line2: event.target.value }))}
                        placeholder="Address line 2"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 sm:col-span-2"
                      />
                      <input
                        value={addressForm.city}
                        onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                        placeholder="City"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                      />
                      <input
                        value={addressForm.state}
                        onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))}
                        placeholder="State"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                      />
                      <input
                        value={addressForm.postalCode}
                        onChange={(event) => setAddressForm((current) => ({ ...current, postalCode: event.target.value }))}
                        placeholder="Postal code"
                        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                      />
                      <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))}
                          className="h-4 w-4 rounded"
                        />
                        Save as default address
                      </label>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>

          <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Payment method
            </h2>
            <div className="mt-6 grid gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`rounded-[28px] border p-5 text-left transition ${
                    paymentMethod === method.id
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FiCreditCard />
                    <div>
                      <p className="font-semibold">{method.title}</p>
                      <p className="text-sm opacity-80">{method.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Order notes
            </h2>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Delivery notes, apartment info, or anything the team should know."
              className="mt-4 w-full rounded-[28px] border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
          </section>
        </div>

        <div>
          <div className="sticky top-28 rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Order summary
            </h2>

            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 rounded-3xl bg-slate-50 p-3">
                  <img
                    src={getProductImage(item, 'checkout')}
                    alt={item.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[32px] bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                <FiMapPin />
                Coupon
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon}
                  className="rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {validatingCoupon ? 'Checking' : 'Apply'}
                </button>
              </div>
              {coupon ? (
                <div className="mt-4 rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">
                  {coupon.code} applied. Discount {formatCurrency(coupon.discountAmount)}.
                </div>
              ) : null}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="font-semibold text-slate-900">{formatCurrency(shipping)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
              </div>
              {discountAmount > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold text-emerald-700">-{formatCurrency(discountAmount)}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">Total</span>
              <span className="text-3xl font-bold text-slate-950">{formatCurrency(grandTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <FiTruck />
              {placingOrder ? 'Placing order...' : 'Place order'}
            </button>

            <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <FiShield />
                Secure checkout
              </div>
              <p className="mt-2">
                Payment flow is seeded for demo usage and can be connected to a live provider later.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
