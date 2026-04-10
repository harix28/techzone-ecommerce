import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiLock,
  FiMail,
  FiShoppingBag,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import StoreLogo from '../../components/ui/StoreLogo';

const BENEFITS = [
  {
    icon: FiHeart,
    title: 'Save what you love',
    description: 'Build a wishlist and come back to products without starting over.',
  },
  {
    icon: FiShoppingBag,
    title: 'Speed up checkout',
    description: 'Keep your profile and delivery details ready for faster purchases.',
  },
  {
    icon: FiCheckCircle,
    title: 'Track every order',
    description: 'Get one place for order history, account details, and saved addresses.',
  },
];

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
    <div className="auth-backdrop min-h-[calc(100vh-160px)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <section className="panel relative overflow-hidden rounded-[36px] bg-[linear-gradient(145deg,#0f172a,#12273f_48%,#0f766e)] p-8 text-white shadow-2xl shadow-slate-950/15 sm:p-10 lg:p-12">
          <div className="floating-blur left-[-50px] top-[-70px] h-44 w-44 bg-[rgba(255,205,128,0.28)]" />
          <div className="floating-blur bottom-[-80px] right-[-50px] h-52 w-52 bg-[rgba(255,255,255,0.12)]" />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <StoreLogo light tagline="New account" />
            </Link>

            <div className="mt-10 max-w-2xl">
              <p className="section-kicker text-cyan-100">Join the storefront</p>
              <h1
                className="headline-balance mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Create a shopper account built for faster discovery and easier repeat buying.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
                Set up your profile once, then move through wishlist, cart, checkout, and order tracking with much less friction.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="glass-panel rounded-[28px] border border-white/10 px-5 py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-200">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[28px] border border-white/10 bg-white/6 px-5 py-5 text-sm leading-7 text-slate-200">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-white underline-offset-4 hover:underline">
                Sign in here
              </Link>{' '}
              to continue your saved shopping journey.
            </div>
          </div>
        </section>

        <section className="panel rounded-[36px] px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-lg">
            <p className="section-kicker">Create account</p>
            <h2
              className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Start shopping smarter
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Register once to unlock saved products, faster checkout, and a cleaner post-purchase dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
                <div className="input-shell">
                  <FiUser className="text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="input h-12 flex-1 border-0 bg-transparent px-0 shadow-none focus:ring-0"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
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
                By creating an account, you're setting up a faster route to saved items, account details, and future checkouts.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary h-12 w-full justify-center"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="store-divider my-8" />

            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-slate-950 underline-offset-4 hover:underline">
                Sign in
                <FiArrowRight size={14} />
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

