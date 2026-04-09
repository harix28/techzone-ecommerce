import { useEffect, useState } from 'react';
import { FiMail, FiMapPin, FiPhone, FiPlusCircle, FiSave, FiTrash2, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

const emptyAddressForm = {
  id: null,
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

export default function StoreProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    password: '',
  });
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await API.get('/users/profile');
      const nextProfile = extractApiData(response);
      setProfile(nextProfile);
      setProfileForm({
        name: nextProfile.name || '',
        phone: nextProfile.phone || '',
        password: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load your profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await API.put('/users/profile', profileForm);
      await refreshUser();
      await loadProfile();
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setSavingAddress(true);
    try {
      if (addressForm.id) {
        await API.put(`/users/addresses/${addressForm.id}`, addressForm);
      } else {
        await API.post('/users/addresses', addressForm);
      }
      await loadProfile();
      setAddressForm(emptyAddressForm);
      setShowAddressForm(false);
      toast.success('Address saved successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await API.delete(`/users/addresses/${addressId}`);
      await loadProfile();
      toast.success('Address deleted successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete address.');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-[520px] rounded-[32px] skeleton" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {profile?.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">Member since {formatDate(profile?.createdAt)}</p>
          </div>
          <div className="ml-auto rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {profile?.role}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Profile details
          </h2>
          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                  className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                  className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">New password</label>
              <input
                type="password"
                value={profileForm.password}
                onChange={(event) => setProfileForm((current) => ({ ...current, password: event.target.value }))}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <FiSave />
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </section>

        <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Saved addresses
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Manage delivery locations for faster checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAddressForm(emptyAddressForm);
                setShowAddressForm((current) => !current);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FiPlusCircle />
              {showAddressForm ? 'Close form' : 'Add address'}
            </button>
          </div>

          {showAddressForm ? (
            <form onSubmit={handleAddressSubmit} className="mt-6 rounded-[32px] border border-slate-200 bg-slate-50 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <FiSave />
                  {savingAddress ? 'Saving...' : addressForm.id ? 'Update address' : 'Save address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    setAddressForm(emptyAddressForm);
                  }}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <div className="mt-6 space-y-4">
            {(profile?.addresses || []).map((address) => (
              <div key={address.id} className="rounded-[32px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{address.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{address.fullName}</p>
                    <p className="mt-2 text-sm text-slate-600">{address.line1}</p>
                    {address.line2 ? <p className="text-sm text-slate-600">{address.line2}</p> : null}
                    <p className="text-sm text-slate-600">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-slate-600">{address.country}</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{address.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {address.isDefault ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Default
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleEditAddress(address)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!profile?.addresses?.length ? (
              <div className="rounded-[32px] border border-dashed border-slate-200 px-6 py-10 text-center text-slate-500">
                No saved addresses yet. Add one to speed up checkout.
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-[32px] bg-slate-50 p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <FiMapPin />
              Profile guidance
            </div>
            <p className="mt-2">
              Update your default address here and it will automatically appear first during checkout.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
