import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiHeadphones,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi';
import API, { extractApiData } from '../../utils/api';
import ProductCard from '../../components/ui/ProductCard';
import { getCategoryIconLabel, getCategoryTheme } from '../../utils/catalog';
import { formatCompactNumber, formatCurrency } from '../../utils/format';

const FEATURES = [
  { icon: FiTruck, title: 'Fast dispatch', desc: 'Free shipping on orders over $99' },
  { icon: FiRefreshCw, title: 'Easy returns', desc: '30-day return window on eligible products' },
  { icon: FiShield, title: 'Protected checkout', desc: 'Secure payments and clear pricing breakdowns' },
  { icon: FiHeadphones, title: 'Expert support', desc: 'Get help choosing the right setup' },
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

  const heroProduct = featuredProducts[0];

  const heroStats = useMemo(
    () => [
      { value: formatCompactNumber(120), label: 'Brands in rotation' },
      { value: formatCompactNumber(48000), label: 'Orders delivered' },
      { value: '4.9/5', label: 'Average shopper rating' },
      { value: '24h', label: 'Typical dispatch window' },
    ],
    [],
  );

  return (
    <div className="space-y-20 pb-8">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,180,84,0.24),_transparent_30%),radial-gradient(circle_at_78%_20%,_rgba(13,148,136,0.28),_transparent_30%),linear-gradient(135deg,_#07111a,_#111827_45%,_#0f2f2a_100%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[linear-gradient(135deg,rgba(56,189,248,0.06),rgba(2,6,23,0))] lg:block" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">
              Modern essentials, curated weekly
            </span>
            <h1
              className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Premium tech for work, play, and everyday upgrades.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Discover high-demand laptops, smartphones, gaming gear, audio, and smart-home devices in a cleaner storefront built for faster decisions and smoother checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="btn-primary px-6 py-3.5"
              >
                Explore catalog
                <FiArrowRight />
              </Link>
              <Link
                to="/products?featured=true"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Shop featured picks
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
            <div className="rounded-[36px] border border-white/10 bg-white/6 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
              <div className="rounded-[30px] bg-[#f4efe6] p-6">
                <img
                  src={heroProduct?.images?.[0]?.imageUrl || `https://picsum.photos/seed/techzone-home-hero/1200/1200`}
                  alt={heroProduct?.name || 'Curated premium electronics'}
                  className="aspect-square w-full rounded-[26px] object-cover"
                />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
                    Editor's pick
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {heroProduct?.name || 'Tech essentials with polished detail'}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {heroProduct?.shortDescription || 'Stronger category entry points, clearer product cards, and a smoother path into checkout.'}
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/8 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Starting at</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {heroProduct ? formatCurrency(heroProduct.price) : '$399'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white/78 p-6 shadow-sm backdrop-blur-xl md:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 rounded-[26px] bg-slate-50/85 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
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
              Start with a clearer path into the catalog
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Each collection is designed to get shoppers into the right buying lane faster, from creator laptops to smart-home upgrades.
            </p>
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
              High-conversion cards for the products that should move first
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Focused pricing, clearer ratings, and quick-add actions make these products easier to scan and shop.
            </p>
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
                  Curated this week
                </p>
                <h2
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  The best blends of performance, style, and everyday value.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                  TechZone now makes the first decision easier with stronger category entry points, clearer product cards, and a more transparent cart-to-checkout flow.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/products?category=gaming"
                    className="btn-primary px-5 py-3"
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
                  'Clearer ratings, pricing, and stock signals on every product card',
                  'Smoother shopping journey from discovery to cart, checkout, and account',
                  'Trust-building delivery, returns, and warranty messaging across the funnel',
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
              Popular products shoppers keep coming back for
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Use these top-selling picks as the fastest route into the strongest categories.
            </p>
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
