import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiX, FiSave } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', shortDescription: '', price: '', originalPrice: '',
  category: '', brand: '', sku: '', stock: '', warranty: '',
  images: [''], features: [''], tags: '',
  isFeatured: false, isActive: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data)).catch(() => {});
    if (isEdit) {
      API.get(`/products/${id}`)
        .then(r => {
          const p = r.data;
          setForm({
            name: p.name || '',
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            price: p.price || '',
            originalPrice: p.originalPrice || '',
            category: p.category?._id || p.category || '',
            brand: p.brand || '',
            sku: p.sku || '',
            stock: p.stock || '',
            warranty: p.warranty || '',
            images: p.images?.length ? p.images : [''],
            features: p.features?.length ? p.features : [''],
            tags: p.tags?.join(', ') || '',
            isFeatured: p.isFeatured || false,
            isActive: p.isActive !== false,
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        images: form.images.filter(Boolean),
        features: form.features.filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (isEdit) {
        await API.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await API.post('/products', payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const updateImage = (i, val) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm(f => ({ ...f, images: imgs }));
  };

  const updateFeature = (i, val) => {
    const feats = [...form.features];
    feats[i] = val;
    setForm(f => ({ ...f, features: feats }));
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-gray-500">{isEdit ? 'Update product details' : 'Create a new product'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input" placeholder="e.g., iPhone 15 Pro Max" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                    className="input" placeholder="Brief one-liner description" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
                  <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="input min-h-[120px] resize-y" placeholder="Detailed product description..." />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Pricing & Stock</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="input" placeholder="999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
                  <input type="number" min="0" step="0.01" value={form.originalPrice}
                    onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    className="input" placeholder="1199 (for discount)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input required type="number" min="0" value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    className="input" placeholder="100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                    className="input" placeholder="APPL-IP15-256" />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Images</h2>
              <p className="text-xs text-gray-500 mb-3">Enter image URLs (e.g., https://picsum.photos/seed/product/600/600)</p>
              <div className="space-y-3">
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={img} onChange={e => updateImage(i, e.target.value)}
                      className="input flex-1" placeholder="https://..." />
                    {form.images.length > 1 && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))}
                  className="btn-secondary flex items-center gap-2 text-sm">
                  <FiPlus size={14} /> Add Image
                </button>
              </div>
              {/* Preview */}
              {form.images.filter(Boolean).length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {form.images.filter(Boolean).map((img, i) => (
                    <img key={i} src={img} alt={`Preview ${i + 1}`}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      onError={e => { e.target.style.display = 'none'; }} />
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Features</h2>
              <div className="space-y-3">
                {form.features.map((feat, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={feat} onChange={e => updateFeature(i, e.target.value)}
                      className="input flex-1" placeholder="e.g., Face ID" />
                    {form.features.length > 1 && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setForm(f => ({ ...f, features: [...f.features, ''] }))}
                  className="btn-secondary flex items-center gap-2 text-sm">
                  <FiPlus size={14} /> Add Feature
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Organization */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="input bg-white">
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input required value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    className="input" placeholder="e.g., Apple" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                  <input value={form.warranty} onChange={e => setForm(f => ({ ...f, warranty: e.target.value }))}
                    className="input" placeholder="1 Year Warranty" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    className="input" placeholder="apple, iphone, 5g (comma separated)" />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Settings</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Featured Product</p>
                    <p className="text-xs text-gray-500">Show on homepage</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Active</p>
                    <p className="text-xs text-gray-500">Visible in store</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base">
              <FiSave size={18} />
              {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}