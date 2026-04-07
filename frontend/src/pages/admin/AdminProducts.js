import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const { data } = await API.get(`/products/admin/all?${params}`);
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Products</h1>
          <p className="text-sm text-gray-500">{total} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="card mb-4">
        <div className="p-4 flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..." className="input pl-9" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Stock</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Sold</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No products found</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/50/50`} alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { e.target.src = `https://picsum.photos/seed/${product._id}/50/50`; }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-48">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand} • {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{product.category?.name}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900">${product.price}</span>
                      {product.originalPrice && <span className="text-xs text-gray-400 line-through ml-1">${product.originalPrice}</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                        {product.stock === 0 ? (
                          <span className="flex items-center gap-1"><FiAlertTriangle size={12} /> Out of stock</span>
                        ) : (
                          `${product.stock} units`
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{product.sold || 0}</td>
                    <td className="px-4 py-4">
                      <span className={product.isActive ? 'badge-success' : 'badge-danger'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/${product._id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEdit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product._id, product.name)} disabled={deleting === product._id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-50">Prev</button>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-blue-600 text-white' : 'btn-secondary'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}