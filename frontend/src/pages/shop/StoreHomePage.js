import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCreditCard,
  FiRefreshCw,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import API, { extractApiData } from '../../utils/api';
import ProductCard from '../../components/ui/ProductCard';
import {
  getCategoryIconLabel,
  getProductHref,
  getProductImage,
} from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

const SERVICE_POINTS = [
  {
    icon: FiTruck,
    title: 'Fast delivery',
    description: 'Same-day dispatch on top-selling electronics and accessories.',
  },
  {
    icon: FiShield,
    title: 'Trusted shopping',
    description: 'Clear pricing, safer payments, and easier order tracking from cart to doorstep.',
  },
  {
    icon: FiRefreshCw,
    title: 'Simple returns',
    description: 'Quick return support on eligible products with fewer checkout surprises.',
  },
  {
    icon: FiCreditCard,
    title: 'Flexible payments',
    description: 'UPI, cards, and cash-on-delivery support on selected orders.',
  },
];

const CATEGORY_ACCENTS = [
  'bg-[#edf4ff] text-[#0f56d9]',
  'bg-[#fff4df] text-[#9a4b00]',
  'bg-[#ecfbf4] text-[#167c3b]',
  'bg-[#f3efff] text-[#6b4fd8]',
  'bg-[#ffeef1] text-[#c42459]',
  'bg-[#eef8ff] text-[#0076a8]',
];

function ProductRailCard({ product, active = false, onSelect }) {
  const imageUrl = getProductImage(product, 'hero-rail');

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`w-[260px] shrink-0 rounded-[24px] border p-3 text-left transition ${
        active
          ? 'border-white bg-white text-slate-950 shadow-xl shadow-[#0a3f98]/20'
          : 'border-white/14 bg-white/10 text-white hover:bg-white/14'
      }`}
    >
      <div className="grid grid-cols-[74px_1fr] items-center gap-3">
        <div className={`rounded-[18px] p-2 ${active ? 'bg-[#f7f9fc]' : 'bg-white/12'}`}>
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-16 w-full object-contain"
            onError={(event) => {
              event.target.src = `https://picsum.photos/seed/hero-rail-${product.id}/300/300`;
            }}
          />
        </div>
        <div className="min-w-0">
          <p
            className={`truncate text-xs font-semibold uppercase tracking-[0.18em] ${
              active ? 'text-[#2874f0]' : 'text-white/72'
            }`}
          >
            {product.brand || 'Top deal'}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6">{product.name}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-sm font-bold">{formatCurrency(product.price)}</span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                active ? 'text-[#2874f0]' : 'text-white'
              }`}
            >
              Preview
              <FiArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function TrendingProductRow({ product }) {
  const href = getProductHref(product);
  const imageUrl = getProductImage(product, 'trending-row');

  return (
    <Link
      to={href}
      className="w-[240px] shrink-0 rounded-[24px] border border-slate-200 bg-[#fbfcff] p-4 transition hover:border-blue-200 hover:shadow-sm"
    >
      <div className="rounded-[20px] bg-white p-4">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-32 w-full object-contain"
          onError={(event) => {
            event.target.src = `https://picsum.photos/seed/trending-${product.id}/400/400`;
          }}
        />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#2874f0]">
        {product.brand || 'Trending'}
      </p>
      <h3 className="mt-2 min-h-[48px] text-sm font-semibold leading-6 text-slate-950">
        {product.name}
      </h3>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-base font-extrabold text-slate-950">
          {formatCurrency(product.price)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Shop now
        </span>
      </div>
    </Link>
  );
}

export default function StoreHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredResponse, popularResponse, categoryResponse] = await Promise.all([
          API.get('/products?featured=true&limit=8'),
          API.get('/products?limit=8&sort=popular'),
          API.get('/categories'),
        ]);

        setFeaturedProducts(extractApiData(featuredResponse));
        setPopularProducts(extractApiData(popularResponse));
        setCategories(extractApiData(categoryResponse));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroProducts = useMemo(() => featuredProducts.slice(0, 5), [featuredProducts]);
  const featuredShelf = useMemo(() => featuredProducts.slice(0, 4), [featuredProducts]);
  const categoryShelf = useMemo(() => categories.slice(0, 6), [categories]);
  const trendingShelf = useMemo(() => popularProducts.slice(0, 6), [popularProducts]);

  useEffect(() => {
    setActiveHeroIndex((current) => {
      if (!heroProducts.length) {
        return 0;
      }

      return current >= heroProducts.length ? 0 : current;
    });
  }, [heroProducts.length]);

  useEffect(() => {
    if (heroProducts.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroProducts.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroProducts]);

  const activeHeroProduct = heroProducts[activeHeroIndex] || featuredProducts[0] || null;
  const heroImage = activeHeroProduct
    ? getProductImage(activeHeroProduct, 'home-hero')
    : 'https://picsum.photos/seed/techzone-home-hero/1200/1200';

  return (
    <div className="space-y-8 pb-8 md:space-y-10">
      <section className="overflow-hidden bg-[linear-gradient(135deg,#0d5ee1_0%,#1563d3_34%,#0f172a_100%)] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-white/12 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/88">
                India electronics store
              </span>
              <h1
                className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Shop smarter tech with a cleaner, faster buying flow.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
                Browse mobiles, laptops, audio, and accessories in a storefront designed
                to feel familiar, reliable, and effortless on every screen size.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/products" className="btn-secondary h-12 bg-white px-5 text-[#172337] hover:bg-white">
                  Explore all products
                </Link>
                <Link to="/products?featured=true" className="btn-primary h-12 px-5">
                  Shop top deals
                  <FiArrowRight />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {SERVICE_POINTS.slice(0, 2).map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0f56d9]">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-white/72">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[560px]">
              <div className="rounded-[32px] bg-white p-4 text-slate-950 shadow-[0_28px_60px_rgba(10,38,88,0.28)] sm:p-5">
                <div className="rounded-[28px] bg-[#f7f9fc] p-6 sm:p-8">
                  <img
                    src={heroImage}
                    alt={activeHeroProduct?.name || 'Featured electronics'}
                    className="h-[280px] w-full object-contain sm:h-[360px] lg:h-[400px]"
                    onError={(event) => {
                      event.target.src = 'https://picsum.photos/seed/techzone-home-hero/1200/1200';
                    }}
                  />
                </div>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2874f0]">
                      Featured pick
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-snug text-slate-950">
                      {activeHeroProduct?.name || 'Curated electronics for everyday upgrades'}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-7 text-slate-600">
                      {activeHeroProduct?.shortDescription ||
                        'Fast-moving products, sharper pricing, and clearer product details for better buying decisions.'}
                    </p>
                  </div>

                  <div className="rounded-[22px] bg-[#f7f9fc] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Starting at
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-950">
                      {activeHeroProduct ? formatCurrency(activeHeroProduct.price) : formatCurrency(39999)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto pb-2 hero-scroll">
            <div className="hero-snap flex min-w-max gap-3">
              {heroProducts.map((product, index) => (
                <ProductRailCard
                  key={product.id}
                  product={product}
                  active={index === activeHeroIndex}
                  onSelect={() => setActiveHeroIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Shop by category
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                Start with the right product lane
              </h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-[#2874f0]">
              View full catalog
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {categoryShelf.map((category, index) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group rounded-[24px] border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ${
                    CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]
                  }`}
                >
                  {getCategoryIconLabel(category)}
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-950">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {category.description || 'Browse the latest picks in this category.'}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2874f0]">
                  Browse
                  <FiArrowRight className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Featured deals
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                Products worth putting in front of shoppers first
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Cleaner cards, faster scanning, and stronger pricing cues make these the
                most conversion-ready picks on the storefront.
              </p>
            </div>
            <Link to="/products?featured=true" className="text-sm font-semibold text-[#2874f0]">
              See all deals
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
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
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featuredShelf.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Why this theme works
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Familiar shopping patterns, less clutter, more confidence
            </h2>
            <div className="mt-6 grid gap-4">
              {SERVICE_POINTS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4 rounded-[22px] bg-[#f7f9fc] px-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2874f0] shadow-sm">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Best sellers
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Scroll through products people buy most
                </h2>
              </div>
              <Link to="/products?sort=popular" className="text-sm font-semibold text-[#2874f0]">
                Browse best sellers
              </Link>
            </div>

            <div className="mt-6 overflow-x-auto pb-2 hero-scroll">
              <div className="flex min-w-max gap-4">
                {trendingShelf.map((product) => (
                  <TrendingProductRow key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
