import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown,
  FiGrid,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiSearch,
  FiSettings,
  FiShoppingCart,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { MdElectricBolt } from 'react-icons/md';
import API, { extractApiData } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getCategoryIconLabel, getCategoryTheme } from '../../utils/catalog';

export default function StorefrontLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    API.get('/categories')
      .then((response) => setCategories(extractApiData(response).slice(0, 5)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = useMemo(
    () => [
      { label: 'All products', href: '/products', accent: 'default' },
      { label: 'Featured', href: '/products?featured=true', accent: 'gaming' },
      ...categories.map((category) => ({
        label: category.name,
        href: `/products?category=${category.slug}`,
        accent: category.slug,
        iconLabel: getCategoryIconLabel(category),
      })),
    ],
    [categories],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-800 bg-slate-950 text-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 text-xs uppercase tracking-[0.22em] sm:px-6 lg:px-8">
          <span>Free shipping over $99</span>
          <span className="hidden md:block">Use TECHZONE10 during checkout for demo coupon coverage</span>
          <Link to="/products?featured=true" className="font-semibold text-cyan-300 transition hover:text-white">
            Explore featured gear
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center gap-4">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <div className="rounded-2xl bg-slate-950 p-2.5 text-white shadow-lg shadow-slate-950/20">
                <MdElectricBolt className="text-2xl" />
              </div>
              <div>
                <span
                  className="block font-display text-xl font-bold text-slate-950"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  TechZone
                </span>
                <span className="block text-xs uppercase tracking-[0.22em] text-slate-400">
                  Premium electronics
                </span>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="hidden flex-1 md:block">
              <div className="relative mx-auto max-w-2xl">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search products, brands, and categories"
                  className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-28 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="ml-auto flex items-center gap-2">
              <NavLink
                to="/wishlist"
                className="relative hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 md:inline-flex"
              >
                <FiHeart />
                {wishlistCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-semibold text-white">
                    {wishlistCount}
                  </span>
                ) : null}
              </NavLink>

              <NavLink
                to="/cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <FiShoppingCart />
                {count > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold text-white">
                    {count > 99 ? '99+' : count}
                  </span>
                ) : null}
              </NavLink>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((current) => !current)}
                    className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden text-left md:block">
                      <p className="text-sm font-semibold text-slate-900">
                        {user.name?.split(' ')[0]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isAdmin ? 'Administrator' : 'Customer'}
                      </p>
                    </div>
                    <FiChevronDown className="text-slate-400" size={16} />
                  </button>

                  {userMenuOpen ? (
                    <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <FiUser /> Profile settings
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <FiPackage /> Order history
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <FiHeart /> Saved items
                        </Link>
                        {isAdmin ? (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                          >
                            <FiSettings /> Admin console
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                        >
                          <FiLogOut /> Sign out
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="hidden items-center gap-2 md:flex">
                  <Link
                    to="/login"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Create account
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
              >
                {mobileOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden border-t border-slate-100 bg-white md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {navLinks.map((link) => {
              const theme = getCategoryTheme(link.accent);

              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? `${theme.surface} border-transparent`
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {link.iconLabel ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-[11px] font-bold">
                      {link.iconLabel}
                    </span>
                  ) : (
                    <FiGrid size={14} />
                  )}
                  {link.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search catalog"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </form>
            <div className="mt-4 grid gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            {!user ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Join now
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <main className="min-h-[60vh]">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 p-2.5 text-white">
                  <MdElectricBolt className="text-2xl" />
                </div>
                <div>
                  <p
                    className="font-display text-xl font-bold text-slate-950"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    TechZone
                  </p>
                  <p className="text-sm text-slate-500">Curated electronics for work, play, and home.</p>
                </div>
              </div>
              <p className="mt-6 max-w-md text-sm leading-7 text-slate-600">
                Shop a seeded demo storefront with laptops, smartphones, gaming gear, smart-home devices, and accessories backed by a production-ready MySQL API.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Shop
              </h3>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <Link to="/products" className="transition hover:text-slate-950">
                  All products
                </Link>
                <Link to="/products?featured=true" className="transition hover:text-slate-950">
                  Featured deals
                </Link>
                <Link to="/products?category=laptops" className="transition hover:text-slate-950">
                  Laptops
                </Link>
                <Link to="/products?category=smartphones" className="transition hover:text-slate-950">
                  Smartphones
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Account
              </h3>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <Link to="/profile" className="transition hover:text-slate-950">
                  Profile settings
                </Link>
                <Link to="/orders" className="transition hover:text-slate-950">
                  Order history
                </Link>
                <Link to="/wishlist" className="transition hover:text-slate-950">
                  Saved items
                </Link>
                {isAdmin ? (
                  <Link to="/admin" className="transition hover:text-slate-950">
                    Admin console
                  </Link>
                ) : null}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Support
              </h3>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p>Seed data includes demo orders, reviews, coupons, and inventory for local testing.</p>
                <p>Frontend is ready for Netlify or Vercel deployment with an external MySQL-backed API.</p>
                <p className="font-medium text-slate-950">support@techzone.dev</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>TechZone eCommerce demo. Built for a clean fullstack deployment flow.</p>
            <div className="flex items-center gap-5">
              <Link to="/products" className="transition hover:text-slate-950">
                Catalog
              </Link>
              <Link to="/checkout" className="transition hover:text-slate-950">
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
