import { useEffect, useState } from 'react';
import { FiEdit, FiPercent, FiPlusCircle, FiTag, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../../utils/api';
import { formatCurrency, formatDateTime } from '../../utils/format';

const emptyCouponForm = {
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  minOrderValue: '0',
  maxDiscountAmount: '',
  startsAt: '',
  endsAt: '',
  usageLimit: '',
  isActive: true,
};

const getCouponSummary = (coupon) => {
  if (coupon.discountType === 'percent') {
    const cap = coupon.maxDiscountAmount ? ` up to ${formatCurrency(coupon.maxDiscountAmount)}` : '';
    return `${coupon.discountValue}% off${cap}`;
  }

  return `${formatCurrency(coupon.discountValue)} off`;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(emptyCouponForm);

  const loadCoupons = async () => {
    setLoading(true);

    try {
      const response = await API.get('/coupons');
      setCoupons(extractApiData(response));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
    setForm(emptyCouponForm);
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(emptyCouponForm);
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percent',
      discountValue: String(coupon.discountValue ?? ''),
      minOrderValue: String(coupon.minOrderValue ?? 0),
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
      endsAt: coupon.endsAt ? coupon.endsAt.slice(0, 16) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      isActive: Boolean(coupon.isActive),
    });
    setModalOpen(true);
  };

  const handleSaveCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue || 0),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        usageLimit: form.usageLimit || null,
        isActive: form.isActive,
      };

      if (editingCoupon) {
        await API.put(`/coupons/${editingCoupon.id}`, payload);
      } else {
        await API.post('/coupons', payload);
      }

      toast.success(`Coupon ${editingCoupon ? 'updated' : 'created'} successfully.`);
      closeModal();
      await loadCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveCoupon = async (couponId) => {
    try {
      await API.delete(`/coupons/${couponId}`);
      toast.success('Coupon archived successfully.');
      await loadCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to archive coupon.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Coupons
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage discounts, promo windows, and order minimums.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiPlusCircle />
            Add coupon
          </button>
        </div>
      </div>

      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                <th className="pb-4">Coupon</th>
                <th className="pb-4">Offer</th>
                <th className="pb-4">Minimum</th>
                <th className="pb-4">Window</th>
                <th className="pb-4">Usage</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                  </tr>
                ))
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <FiTag />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{coupon.code}</p>
                          <p className="text-sm text-slate-500">
                            {coupon.description || 'No description added'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-slate-700">{getCouponSummary(coupon)}</td>
                    <td className="py-4 text-slate-600">{formatCurrency(coupon.minOrderValue)}</td>
                    <td className="py-4 text-slate-600">
                      <div className="space-y-1">
                        <p>{coupon.startsAt ? formatDateTime(coupon.startsAt) : 'Starts immediately'}</p>
                        <p>{coupon.endsAt ? formatDateTime(coupon.endsAt) : 'No expiry set'}</p>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600">
                      {coupon.usageCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / unlimited'}
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                        coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(coupon)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        >
                          <FiEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveCoupon(coupon.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-3xl rounded-[36px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Promotions</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {editingCoupon ? 'Edit coupon' : 'Create coupon'}
                </h3>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                <FiPercent />
              </div>
            </div>

            <form onSubmit={handleSaveCoupon} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                  placeholder="Coupon code"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                  required
                />
                <select
                  value={form.discountType}
                  onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value }))}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500"
                >
                  <option value="percent">Percentage discount</option>
                  <option value="fixed">Fixed amount discount</option>
                </select>
                <input
                  value={form.discountValue}
                  onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
                  type="number"
                  step="0.01"
                  placeholder={form.discountType === 'percent' ? 'Discount percent' : 'Discount amount'}
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                  required
                />
                <input
                  value={form.minOrderValue}
                  onChange={(event) => setForm((current) => ({ ...current, minOrderValue: event.target.value }))}
                  type="number"
                  step="0.01"
                  placeholder="Minimum order value"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <input
                  value={form.maxDiscountAmount}
                  onChange={(event) => setForm((current) => ({ ...current, maxDiscountAmount: event.target.value }))}
                  type="number"
                  step="0.01"
                  placeholder="Max discount cap"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <input
                  value={form.usageLimit}
                  onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))}
                  type="number"
                  placeholder="Usage limit"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <input
                  value={form.startsAt}
                  onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                  type="datetime-local"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <input
                  value={form.endsAt}
                  onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
                  type="datetime-local"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                placeholder="What does this coupon apply to?"
                className="w-full rounded-[28px] border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />

              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                Coupon is active and can be redeemed
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <FiPlusCircle />
                  {saving ? 'Saving...' : editingCoupon ? 'Save changes' : 'Create coupon'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
