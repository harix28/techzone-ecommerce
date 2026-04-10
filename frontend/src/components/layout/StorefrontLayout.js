import { useDeferredValue, useEffect, useMemo, useState } from 'react';
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
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiUser,
  FiX,
} from 'react-icons/fi';
import API, { extractApiData } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import StoreLogo from '../ui/StoreLogo';
import { getCategoryIconLabel, getProductHref } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

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
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    API.get('/categories')
      .then((response) => setCategories(extractApiData(response).slice(0, 6)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const nextQuery = deferredSearch.trim();

    if (nextQuery.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    let active = true;
    setSearching(true);

    API.get(`/products?search=${encodeURIComponent(nextQuery)}&limit=5`)
      .then((response) => {
        if (active) {
          setSearchSuggestions(extractApiData(response));
        }
      })
      .catch(() => {
        if (active) {
          setSearchSuggestions([]);
        }
      })
      .finally(() => {
        if (active) {
          setSearching(false);
        }
      });

    return () => {
      active = false;
    };
  }, [deferredSearch]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = useMemo(
    () => [
      { label: 'All products', href: '/products', accent: 'default' },
      { label: 'Featured', href: '/products?featured=true', accent: 'gaming' },
      { label: 'New arrivals', href: '/products?sort=newest', accent: 'smartphones' },
      { label: 'Best sellers', href: '/products?sort=popular', accent: 'audio' },
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
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="border-b border-[#0f56d9] bg-[#0f56d9] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <FiTruck size={13} />
              Free shipping over ₹4,999
            </span>
            <span className="hidden items-center gap-2 md:inline-flex">
              <FiShield size={13} />
              Protected checkout
            </span>
          </div>
          <span className="hidden items-center gap-2 text-white/90 md:inline-flex">
            <FiStar size={13} />
            Top deals across mobiles, laptops, audio, and smart home
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[#dfe5ee] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[74px] items-center gap-3 lg:gap-5">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <StoreLogo tagline="India store" />
            </Link>

            <form onSubmit={handleSearch} className="relative hidden flex-1 md:block">
              <div className="relative mx-auto max-w-3xl">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for products, brands and categories"
                  className="input h-12 w-full rounded-xl bg-[#f7f9fc] pl-12 pr-28"
                />
                <button
                  type="submit"
                  className="btn-primary absolute right-1.5 top-1.5 h-9 rounded-lg px-4 text-xs uppercase tracking-[0.12em]"
                >
                  Search
                </button>
              </div>

              {deferredSearch.trim().length >= 2 ? (
                <div className="absolute left-1/2 top-full z-40 mt-3 w-full max-w-3xl -translate-x-1/2 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                  <div className="border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {searching ? 'Searching...' : 'Suggested results'}
                  </div>
                  <div className="p-2">
                    {searchSuggestions.length ? (
                      searchSuggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            navigate(getProductHref(product));
                            setSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between gap-4 rounded-[20px] px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{product.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{product.brand}</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {formatCurrency(product.price)}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-sm text-slate-500">
                        No direct matches yet. Try a product name, brand, or category.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </form>

            <div className="ml-auto flex items-center gap-2">
              <NavLink
                to="/wishlist"
                className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 md:inline-flex"
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
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2874f0]"
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
                    className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2874f0] text-sm font-semibold text-white">
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
                    <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
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
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
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
                  <Link to="/login" className="btn-secondary h-11 px-4">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary h-11 px-4">
                    Create account
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
              >
                {mobileOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden border-t border-slate-200 bg-[#fffbeb] md:block">
          <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
            {navLinks.map((link) => {
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-transparent bg-[#2874f0] text-white'
                        : 'border-transparent bg-transparent text-slate-700 hover:bg-white hover:text-slate-900'
                    }`
                  }
                >
                  {link.iconLabel ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/80 text-[11px] font-bold text-slate-700">
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
          <div className="border-t border-slate-200 bg-[#f8faff] px-4 py-4 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search catalog"
                className="input h-12 w-full rounded-xl bg-white pl-12 pr-4"
              />
            </form>
            <div className="mt-4 grid gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#2874f0] text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
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
                  className="btn-secondary rounded-2xl"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary rounded-2xl"
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

      <footer className="mt-16 border-t border-slate-200 bg-[#172337] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-6 rounded-[24px] bg-[#0f56d9] px-6 py-8 text-white lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="section-kicker text-white/70">Need help deciding?</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                Find the right device faster with cleaner search, pricing, and checkout.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
                Browse mobiles, laptops, audio gear, appliances, and accessories with clearer filtering and fewer distractions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary">
                  Explore catalog
                </Link>
                <Link
                  to="/products?featured=true"
                  className="btn-secondary border-white/20 bg-white text-[#172337] hover:bg-white"
                >
                  Shop top deals
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                'Trusted payments, easy address selection, and a cleaner review of totals.',
                'Wishlist, cart, and account details stay connected across devices.',
                'Clear delivery, stock, and rating information on every key shopping screen.',
              ].map((item) => (
                <div key={item} className="rounded-[18px] border border-white/12 bg-white/10 px-4 py-4 text-sm leading-7 text-white/88">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <StoreLogo light tagline="Shop smarter" />
              <p className="mt-6 max-w-md text-sm leading-7 text-white/72">
                TechZone brings a simpler India-first shopping experience for electronics, accessories, audio, and smart home products.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
                Shop
              </h3>
              <div className="mt-5 grid gap-3 text-sm text-white/78">
                <Link to="/products" className="transition hover:text-white">
                  All products
                </Link>
                <Link to="/products?featured=true" className="transition hover:text-white">
                  Top deals
                </Link>
                <Link to="/products?category=laptops" className="transition hover:text-white">
                  Laptops
                </Link>
                <Link to="/products?category=smartphones" className="transition hover:text-white">
                  Mobiles
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
                Account
              </h3>
              <div className="mt-5 grid gap-3 text-sm text-white/78">
                <Link to="/profile" className="transition hover:text-white">
                  Profile settings
                </Link>
                <Link to="/orders" className="transition hover:text-white">
                  Order history
                </Link>
                <Link to="/wishlist" className="transition hover:text-white">
                  Saved items
                </Link>
                {isAdmin ? (
                  <Link to="/admin" className="transition hover:text-white">
                    Admin console
                  </Link>
                ) : null}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
                Support
              </h3>
              <div className="mt-5 space-y-3 text-sm text-white/78">
                <p>Delivery and returns</p>
                <p>Warranty coverage</p>
                <p className="font-medium text-white">support@techzone.dev</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
            <p>TechZone storefront built for clear product discovery, trusted pricing, and faster mobile shopping.</p>
            <div className="flex items-center gap-5">
              <Link to="/products" className="transition hover:text-white">
                Catalog
              </Link>
              <Link to="/wishlist" className="transition hover:text-white">
                Wishlist
              </Link>
              <Link to="/checkout" className="transition hover:text-white">
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

