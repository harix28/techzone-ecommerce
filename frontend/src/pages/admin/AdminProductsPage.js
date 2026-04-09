import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiPlusCircle, FiSearch, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData, extractApiMeta } from '../../utils/api';
import { getProductImage } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/products/admin/all', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
        },
      });
      setProducts(extractApiData(response));
      setMeta(extractApiMeta(response));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const handleDelete = async (productId) => {
    try {
      await API.delete(`/products/${productId}`);
      toast.success('Product archived successfully.');
      await loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to archive product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Products
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {meta.total || 0} products across the catalog.
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiPlusCircle />
            Add product
          </Link>
        </div>

        <div className="mt-6 rounded-[32px] bg-slate-50 p-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search products"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                <th className="pb-4">Product</th>
                <th className="pb-4">Category</th>
                <th className="pb-4">Price</th>
                <th className="pb-4">Stock</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                    <td className="py-4"><div className="h-10 rounded-full skeleton" /></td>
                  </tr>
                ))
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImage(product, 'admin-product')}
                          alt={product.name}
                          className="h-14 w-14 rounded-3xl object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.brand} / {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600">{product.category?.name}</td>
                    <td className="py-4 font-semibold text-slate-900">{formatCurrency(product.price)}</td>
                    <td className="py-4 text-slate-600">{product.stockQuantity}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                        product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {product.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        >
                          <FiEdit />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: meta.totalPages }).map((_, index) => {
              const nextPage = index + 1;

              return (
                <button
                  key={nextPage}
                  type="button"
                  onClick={() => setPage(nextPage)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
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
              onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
              disabled={page >= meta.totalPages}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
