import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiSearch, FiStar, FiX } from 'react-icons/fi';
import API, { extractApiData, extractApiMeta } from '../../utils/api';
import ProductCard from '../../components/ui/ProductCard';
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Storefront catalog
            </p>
            <h1
              className="mt-3 text-3xl font-bold text-slate-950"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {meta.total || 0} products found{currentCategory ? ` in ${currentCategory.name}` : ''}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:hidden"
          >
            <FiFilter /> Filters
          </button>
        </div>

        {hasFilters ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {search ? (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                Search: {search}
              </span>
            ) : null}
            {currentCategory ? (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                Category: {currentCategory.name}
              </span>
            ) : null}
            {(minPrice || maxPrice) ? (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                Price: {priceLabel}
              </span>
            ) : null}
            {featured ? (
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
                Featured only
              </span>
            ) : null}
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <FiX /> Clear filters
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex gap-6">
        <aside className={`${showFilters ? 'block' : 'hidden'} w-full shrink-0 md:block md:w-72`}>
          <div className="sticky top-28 space-y-5 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Filter catalog</h2>
              <p className="mt-1 text-sm text-slate-500">
                Narrow products by category, price, and curation.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Search term
              </label>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  updateFilter({ search: formData.get('search') || '' });
                }}
                className="relative"
              >
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Search catalog"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
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
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
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
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Price range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(event) => updateFilter({ minPrice: event.target.value })}
                  placeholder="Min"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(event) => updateFilter({ maxPrice: event.target.value })}
                  placeholder="Max"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
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

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Sort by
                </label>
                <select
                  value={sort}
                  onChange={(event) => updateFilter({ sort: event.target.value })}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500"
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
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-500">
              Page {meta.page || 1} of {meta.totalPages || 1}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              <FiFilter size={14} />
              {featured ? 'Featured' : currentCategory?.name || 'All'} / {priceLabel}
            </div>
          </div>

          {error ? (
            <div className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700">
              {error}
            </div>
          ) : loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
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
          ) : products.length === 0 ? (
            <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                No products match your filters
              </h3>
              <p className="mt-3 text-slate-500">
                Try broadening the search or resetting the current filter set.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {meta.totalPages > 1 ? (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilter({ page: Math.max(1, page - 1) })}
                    disabled={page <= 1}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: meta.totalPages }).map((_, index) => {
                    const nextPage = index + 1;

                    return (
                      <button
                        key={nextPage}
                        type="button"
                        onClick={() => updateFilter({ page: nextPage })}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                          page === nextPage
                            ? 'bg-slate-950 text-white'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {nextPage}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => updateFilter({ page: Math.min(meta.totalPages, page + 1) })}
                    disabled={page >= meta.totalPages}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}
