import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import API from '../../utils/api';
import ProductCard from '../../components/ui/ProductCard';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 12, sort });
        if (search) params.set('search', search);
        if (categoryFilter) {
          const cat = categories.find(c => c.slug === categoryFilter);
          if (cat) params.set('category', cat._id);
        }
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);

        const { data } = await API.get(`/products?${params}`);
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, categoryFilter, sort, minPrice, maxPrice, page, categories]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setPage(1);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  const hasFilters = search || categoryFilter || minPrice || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {search ? `Results for "${search}"` : categoryFilter ? categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1) : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} products found</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="md:hidden btn-secondary flex items-center gap-2">
          <FiFilter size={16} /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
          <div className="card p-4 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                  <FiX size={14} /> Clear
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
              <div className="space-y-1">
                <button onClick={() => updateFilter('category', '')}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!categoryFilter ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  All Categories
                </button>
                {categories.map(cat => (
                  <button key={cat._id} onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${categoryFilter === cat.slug ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="input text-sm py-2 px-2" />
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="input text-sm py-2 px-2" />
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {[['Under $100', '', '100'], ['$100-$500', '100', '500'], ['$500-$1000', '500', '1000'], ['$1000+', '1000', '']].map(([label, min, max]) => (
                  <button key={label} onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    min ? params.set('minPrice', min) : params.delete('minPrice');
                    max ? params.set('maxPrice', max) : params.delete('maxPrice');
                    setSearchParams(params);
                  }} className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Sort & View Controls */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">{total} products</p>
            <div className="flex items-center gap-3">
              <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card">
                  <div className="aspect-square skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 skeleton rounded w-1/3" />
                    <div className="h-4 skeleton rounded" />
                    <div className="h-4 skeleton rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-secondary disabled:opacity-50 px-4 py-2">Previous</button>
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm ${page === i + 1 ? 'bg-blue-600 text-white' : 'btn-secondary'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                    className="btn-secondary disabled:opacity-50 px-4 py-2">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}