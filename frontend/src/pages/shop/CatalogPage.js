import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiFilter,
  FiGrid,
  FiList,
  FiSearch,
  FiSliders,
  FiStar,
  FiX,
} from 'react-icons/fi';
import API, { extractApiData, extractApiMeta } from '../../utils/api';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import EmptyState from '../../components/ui/EmptyState';
import ProductCard from '../../components/ui/ProductCard';
import SectionHeading from '../../components/ui/SectionHeading';
import { formatCurrency } from '../../utils/format';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') === 'true';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    API.get('/categories')
      .then((response) => setCategories(extractApiData(response)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({ page: String(page), limit: '12' });

        if (search) params.set('search', search);
        if (categoryFilter) params.set('category', categoryFilter);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (featured) params.set('featured', 'true');
        if (sort !== 'newest') params.set('sort', sort);

        const response = await API.get(`/products?${params.toString()}`);
        setProducts(extractApiData(response));
        setMeta(extractApiMeta(response));
      } catch (errorResponse) {
        setError(errorResponse.response?.data?.message || 'Unable to load products right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, featured, maxPrice, minPrice, page, search, sort]);

  const updateFilter = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || value === false) {
        params.delete(key);
        return;
      }

      params.set(key, String(value));
    });

    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
      params.delete('page');
    }

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = search || categoryFilter || minPrice || maxPrice || featured;
  const currentCategory = categories.find((category) => category.slug === categoryFilter);
  const title = featured
    ? 'Featured products'
    : search
      ? `Results for "${search}"`
      : currentCategory?.name || 'All products';
  const priceLabel = useMemo(() => {
    if (minPrice && maxPrice) {
      return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    }

    if (minPrice) {
      return `From ${formatCurrency(minPrice)}`;
    }

    if (maxPrice) {
      return `Up to ${formatCurrency(maxPrice)}`;
    }

    return 'Any price';
  }, [maxPrice, minPrice]);

  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label || SORT_OPTIONS[0].label;
  const headingDescription = featured
    ? 'A curated set of high-intent products positioned to move quickly with clearer pricing, ratings, and stock cues.'
    : search
      ? 'Browse the closest product matches and refine quickly with category, price, and curation controls.'
      : currentCategory
        ? `Explore ${currentCategory.name.toLowerCase()} with faster filtering, clearer cards, and a smoother path into product detail pages.`
        : 'Browse the full TechZone assortment with responsive filters, strong merchandising, and a clearer route from discovery to checkout.';
  const resultSummary = `${meta.total || 0} products`;
  const pages = Array.from({ length: meta.totalPages || 0 }, (_, index) => index + 1);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="panel relative overflow-hidden rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="floating-blur left-[-40px] top-[-60px] h-36 w-36 bg-[rgba(13,148,136,0.15)]" />
          <div className="floating-blur bottom-[-80px] right-[-30px] h-48 w-48 bg-[rgba(251,191,36,0.16)]" />

          <div className="relative">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Catalog', href: '/products' },
                ...(currentCategory ? [{ label: currentCategory.name }] : [{ label: title }]),
              ]}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <SectionHeading
                  eyebrow="Storefront catalog"
                  title={title}
                  description={headingDescription}
                  align="start"
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="pill bg-slate-950 text-white">{resultSummary}</div>
                  <div className="pill pill-muted">{sortLabel}</div>
                  <div className="pill pill-muted">{priceLabel}</div>
                  {featured ? <div className="pill bg-amber-100 text-amber-800">Featured only</div> : null}
                </div>
              </div>

              <div className="grid gap-4 rounded-[32px] bg-[rgba(15,23,42,0.04)] p-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-[26px] bg-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Browse state</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950">{meta.page || 1}</p>
                  <p className="mt-1 text-sm text-slate-500">Current page of {meta.totalPages || 1}</p>
                </div>
                <div className="rounded-[26px] bg-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current lane</p>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    {featured ? 'Featured' : currentCategory?.name || 'All products'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Use filters to narrow by price, category, and search.</p>
                </div>
                <div className="rounded-[26px] bg-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quick route</p>
                  <Link to="/products?featured=true" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                    Shop featured
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">Jump to the most merchandised set in one tap.</p>
                </div>
              </div>
            </div>

            {hasFilters ? (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {search ? <span className="pill pill-muted">Search: {search}</span> : null}
                {currentCategory ? <span className="pill pill-muted">Category: {currentCategory.name}</span> : null}
                {(minPrice || maxPrice) ? <span className="pill pill-muted">Price: {priceLabel}</span> : null}
                {featured ? <span className="pill bg-amber-100 text-amber-800">Featured</span> : null}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-ghost h-10 border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <FiX />
                  Clear filters
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <div className="mt-8 flex gap-6">
          <aside className={`${showFilters ? 'block' : 'hidden'} w-full shrink-0 md:block md:w-80`}>
            <div className="panel sticky top-28 space-y-5 rounded-[32px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-kicker">Refine results</p>
                  <h2 className="mt-3 text-xl font-bold text-slate-950">Filter catalog</h2>
                </div>
                <span className="pill pill-muted">{meta.total || 0}</span>
              </div>

              <div className="panel-muted rounded-[28px] p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Search term
                </label>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    updateFilter({ search: formData.get('search') || '' });
                  }}
                  className="input-shell"
                >
                  <FiSearch className="text-slate-400" />
                  <input
                    name="search"
                    defaultValue={search}
                    placeholder="Search catalog"
                    className="input h-12 flex-1 border-0 bg-transparent px-0 shadow-none focus:ring-0"
                  />
                </form>
              </div>

              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Category
                </label>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilter({ category: '' })}
                    className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                      !categoryFilter
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    All categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => updateFilter({ category: category.slug })}
                      className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                        categoryFilter === category.slug
                          ? 'bg-slate-950 text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-muted rounded-[28px] p-4">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Price range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(event) => updateFilter({ minPrice: event.target.value })}
                    placeholder="Min"
                    className="input h-12"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(event) => updateFilter({ maxPrice: event.target.value })}
                    placeholder="Max"
                    className="input h-12"
                  />
                </div>
              </div>

              <div className="panel-muted rounded-[28px] p-4">
                <button
                  type="button"
                  onClick={() => updateFilter({ featured: featured ? '' : 'true' })}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    featured
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiStar /> Featured only
                  </span>
                  <span>{featured ? 'On' : 'Off'}</span>
                </button>

                <div className="mt-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Sort by
                  </label>
                  <select
                    value={sort}
                    onChange={(event) => updateFilter({ sort: event.target.value })}
                    className="input h-12 w-full"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="panel mb-5 rounded-[28px] px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="pill pill-muted">
                    <FiSliders size={14} />
                    {featured ? 'Featured' : currentCategory?.name || 'All'} / {priceLabel}
                  </span>
                  <span>Sorted by {sortLabel}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters((current) => !current)}
                    className="btn-secondary h-10 px-4 md:hidden"
                  >
                    <FiFilter />
                    Filters
                  </button>
                  <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                        viewMode === 'grid' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      aria-label="Grid view"
                    >
                      <FiGrid />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                        viewMode === 'list' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      aria-label="List view"
                    >
                      <FiList />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700">
                {error}
              </div>
            ) : loading ? (
              <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-5'}>
                {Array.from({ length: viewMode === 'grid' ? 9 : 6 }).map((_, index) => (
                  <div key={index} className="card overflow-hidden rounded-[28px]">
                    <div className={viewMode === 'grid' ? 'aspect-square skeleton' : 'h-56 skeleton'} />
                    <div className="space-y-3 p-5">
                      <div className="h-3 w-24 rounded-full skeleton" />
                      <div className="h-5 rounded-full skeleton" />
                      <div className="h-5 w-3/4 rounded-full skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="panel rounded-[32px]">
                <EmptyState
                  icon={FiSearch}
                  title="No products match your filters"
                  description="Try broadening the search, switching categories, or clearing the current filter set."
                  action={
                    <button type="button" onClick={clearFilters} className="btn-primary">
                      Reset filters
                    </button>
                  }
                  secondaryAction={
                    <Link to="/products?featured=true" className="btn-secondary">
                      View featured
                    </Link>
                  }
                  className="py-16"
                />
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-5'}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      layout={viewMode === 'grid' ? 'grid' : 'list'}
                    />
                  ))}
                </div>

                {meta.totalPages > 1 ? (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateFilter({ page: Math.max(1, page - 1) })}
                      disabled={page <= 1}
                      className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {pages.map((nextPage) => (
                      <button
                        key={nextPage}
                        type="button"
                        onClick={() => updateFilter({ page: nextPage })}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                          page === nextPage
                            ? 'bg-slate-950 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {nextPage}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateFilter({ page: Math.min(meta.totalPages, page + 1) })}
                      disabled={page >= meta.totalPages}
                      className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
