import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { MdElectricBolt } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const TRUST_POINTS = [
  {
    icon: FiShield,
    title: 'Protected account access',
    description: 'Secure sessions, saved addresses, and a faster route into checkout.',
  },
  {
    icon: FiTruck,
    title: 'Faster repeat orders',
    description: 'Keep your cart, saved products, and recent order history in one place.',
  },
  {
    icon: FiCheckCircle,
    title: 'Cleaner buying flow',
    description: 'Jump back into the catalog, wishlist, or order tracking without friction.',
  },
];

export default function StoreLoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const session = await login(email, password);
      navigate(session.user.role === 'admin' ? '/admin' : redirectTo, { replace: true });
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="auth-backdrop min-h-[calc(100vh-160px)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel relative overflow-hidden rounded-[36px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/15 sm:p-10 lg:p-12">
          <div className="floating-blur left-[-60px] top-[-80px] h-40 w-40 bg-[rgba(255,195,113,0.28)]" />
          <div className="floating-blur bottom-[-90px] right-[-40px] h-52 w-52 bg-[rgba(45,212,191,0.22)]" />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="rounded-[18px] bg-white/10 p-3 text-white">
                <MdElectricBolt className="text-2xl" />
              </div>
              <div>
                <p className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  TechZone
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Account access
                </p>
              </div>
            </Link>

            <div className="mt-10 max-w-2xl">
              <p className="section-kicker text-amber-200">Welcome back</p>
              <h1
                className="headline-balance mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Pick up where you left off, with a faster path from login to checkout.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Sign in to review saved items, manage delivery details, and get back into the storefront without losing momentum.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="glass-panel flex items-start gap-4 rounded-[28px] border border-white/10 px-5 py-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                New here?
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-md text-sm leading-7 text-slate-300">
                  Create an account to save your wishlist, speed up checkout, and keep all your orders in one dashboard.
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Create account
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="panel rounded-[36px] px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-lg">
            <p className="section-kicker">Sign in</p>
            <h2
              className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Access your account
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Continue to checkout, review orders, and manage saved products from one place.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <div className="input-shell">
                  <FiMail className="text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="input h-12 flex-1 border-0 bg-transparent px-0 shadow-none focus:ring-0"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <div className="input-shell">
                  <FiLock className="text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="input h-12 flex-1 border-0 bg-transparent px-0 shadow-none focus:ring-0"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] bg-[rgba(15,23,42,0.04)] px-5 py-4 text-sm leading-7 text-slate-600">
                Signing in keeps your cart, wishlist, and saved delivery details synced across the storefront.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary h-12 w-full justify-center"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="store-divider my-8" />

            <p className="text-sm text-slate-600">
              Need an account?{' '}
              <Link to="/register" className="font-semibold text-slate-950 underline-offset-4 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
