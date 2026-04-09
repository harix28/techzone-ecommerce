import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiHeadphones,
  FiRefreshCw,
  FiShield,
  FiSmartphone,
  FiTruck,
} from 'react-icons/fi';
import API, { extractApiData } from '../../utils/api';
import ProductCard from '../../components/ui/ProductCard';
import { getCategoryIconLabel, getCategoryTheme } from '../../utils/catalog';
import { formatCompactNumber } from '../../utils/format';

const FEATURES = [
  { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $99' },
  { icon: FiRefreshCw, title: '30-Day Returns', desc: 'Hassle-free returns' },
  { icon: FiShield, title: 'Warranty', desc: 'Official warranties on all products' },
  { icon: FiHeadphones, title: 'Priority Support', desc: 'Fast help for every order' },
];

export default function StoreHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredResponse, popularResponse, categoryResponse] = await Promise.all([
          API.get('/products?featured=true&limit=8'),
          API.get('/products?limit=8&sort=popular'),
          API.get('/categories'),
        ]);

        setFeaturedProducts(extractApiData(featuredResponse));
        setNewArrivals(extractApiData(popularResponse));
        setCategories(extractApiData(categoryResponse));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroStats = useMemo(
    () => [
      { value: formatCompactNumber(2500), label: 'Products ready to demo' },
      { value: formatCompactNumber(120), label: 'Trusted brands' },
      { value: formatCompactNumber(48000), label: 'Orders processed' },
      { value: '99.2%', label: 'Satisfaction rating' },
    ],
    [],
  );

  return (
    <div className="space-y-20 pb-8">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(99,102,241,0.24),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a_42%,_#111827_100%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[linear-gradient(135deg,rgba(56,189,248,0.06),rgba(2,6,23,0))] lg:block" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              New season catalog
            </span>
            <h1
              className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Premium electronics, deployed with a clean fullstack core.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              TechZone pairs a polished modern storefront with a production-ready MySQL API for products, cart, wishlist, checkout, orders, and admin operations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Explore catalog
                <FiArrowRight />
              </Link>
              <Link
                to="/products?featured=true"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View featured builds
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 self-center lg:pl-8">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-3 text-cyan-200">
                <FiSmartphone size={20} />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                  Launch ready flows
                </span>
              </div>
              <div className="mt-8 space-y-4">
                {[
                  'JWT auth with refresh tokens and RBAC',
                  'MySQL schema with realistic catalog seed data',
                  'Responsive customer and admin experiences',
                ].map((line) => (
                  <div key={line} className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-4 text-sm text-slate-200">
                    {line}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] bg-white p-6 text-slate-900 shadow-2xl shadow-slate-950/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Best for
                </p>
                <p className="mt-3 text-2xl font-bold">Netlify frontend</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ship the React storefront as static assets with environment-aware API routing.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-900/60 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Best for
                </p>
                <p className="mt-3 text-2xl font-bold">Vercel backend</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Connect the API to hosted MySQL with secure cookies and controlled CORS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Shop by category
            </p>
            <h2
              className="mt-3 text-3xl font-bold text-slate-950"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Browse the catalog with focused entry points
            </h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-blue-700 transition hover:text-slate-950">
            View all categories
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const theme = getCategoryTheme(category.slug);

            return (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className={`group overflow-hidden rounded-[28px] bg-gradient-to-br ${theme.gradient} p-[1px] shadow-lg shadow-slate-900/10 transition hover:-translate-y-1`}
              >
                <div className="flex h-full flex-col justify-between rounded-[27px] bg-white/95 p-6 backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {category.slug.replace('-', ' ')}
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-slate-950">{category.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {category.description}
                      </p>
                    </div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                      {getCategoryIconLabel(category)}
                    </span>
                  </div>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                    Browse now
                    <FiArrowRight className="transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Featured now
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Top picks across the seeded storefront
            </h2>
          </div>
          <Link to="/products?featured=true" className="text-sm font-semibold text-blue-700 transition hover:text-slate-950">
            See all featured
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="card overflow-hidden rounded-[28px]">
                <div className="aspect-square skeleton" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 rounded-full skeleton" />
                  <div className="h-5 rounded-full skeleton" />
                  <div className="h-5 w-3/4 rounded-full skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-700 via-slate-900 to-cyan-700 p-[1px] shadow-xl shadow-slate-900/15">
            <div className="grid h-full gap-10 rounded-[35px] bg-slate-950 px-8 py-10 text-white md:grid-cols-[1fr_0.7fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Launch campaign
                </p>
                <h2
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Gaming rigs, creator laptops, and flagship phones in one polished stack.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                  The upgraded TechZone project now ships with realistic seed data, secure auth flows, inventory-aware checkout, and a deployable split for Netlify and Vercel.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/products?category=gaming"
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Shop gaming
                    <FiArrowRight />
                  </Link>
                  <Link
                    to="/products?category=laptops"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    See creator laptops
                  </Link>
                </div>
              </div>
              <div className="grid gap-3 self-center">
                {[
                  'Admin dashboard with product, category, user, order, and coupon management',
                  'Customer flows for cart, wishlist, addresses, checkout, and order history',
                  'Deployment-ready environment handling for external MySQL hosts',
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Fresh arrivals
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              New and trending products
            </h2>
            <div className="mt-6 space-y-4">
              {newArrivals.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug || product.id}`}
                  className="flex items-center gap-4 rounded-3xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                    {product.brand?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.brand}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">
                    {formatCompactNumber(product.price)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Customer favorites
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Popular products from seeded orders and reviews
            </h2>
          </div>
          <Link to="/products?sort=popular" className="text-sm font-semibold text-blue-700 transition hover:text-slate-950">
            Browse top sellers
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
