import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { MdElectricBolt } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

export default function StoreRegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await register(name, email, password);
      navigate('/');
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-slate-950 p-12 text-white lg:block">
          <div className="inline-flex rounded-2xl bg-cyan-400/15 p-4 text-cyan-300">
            <MdElectricBolt className="text-4xl" />
          </div>
          <h1 className="mt-8 text-5xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Join TechZone
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">
            Create a customer account to save products, manage delivery addresses, and place demo orders through the upgraded eCommerce stack.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mx-auto max-w-md">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="rounded-2xl bg-slate-950 p-2.5 text-white">
                <MdElectricBolt className="text-2xl" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  TechZone
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Create account
                </p>
              </div>
            </Link>

            <div className="mt-12">
              <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Register
              </h2>
              <p className="mt-3 text-slate-500">
                Get a personalized account for checkout, wishlist, and order history.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500"
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-8 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
