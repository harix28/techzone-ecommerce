import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlusCircle, FiSave, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../../utils/api';

const emptyForm = {
  name: '',
  description: '',
  shortDescription: '',
  price: '',
  compareAtPrice: '',
  categoryId: '',
  brand: '',
  sku: '',
  stockQuantity: '',
  lowStockThreshold: '5',
  warranty: '',
  searchKeywords: '',
  images: [''],
  features: [''],
  specifications: [{ key: '', value: '' }],
  isFeatured: false,
  isActive: true,
};

export default function AdminProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/categories')
      .then((response) => setCategories(extractApiData(response)))
      .catch(() => {});

    if (!isEditing) {
      return;
    }

    API.get(`/products/${id}`)
      .then((response) => {
        const product = extractApiData(response);
        setForm({
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
          categoryId: String(product.category?.id || ''),
          brand: product.brand,
          sku: product.sku,
          stockQuantity: String(product.stockQuantity),
          lowStockThreshold: String(product.lowStockThreshold || 5),
          warranty: product.warranty || '',
          searchKeywords: product.searchKeywords || '',
          images: product.images?.length ? product.images.map((image) => image.imageUrl) : [''],
          features: product.features?.length
            ? product.features.map((feature) => feature.featureText || feature)
            : [''],
          specifications: product.specifications?.length
            ? product.specifications.map((item) => ({ key: item.key, value: item.value }))
            : [{ key: '', value: '' }],
          isFeatured: Boolean(product.isFeatured),
          isActive: Boolean(product.isActive),
        });
      })
      .catch((error) => toast.error(error.response?.data?.message || 'Unable to load product.'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const updateListField = (field, index, value) => {
    setForm((current) => {
      const nextValues = [...current[field]];
      nextValues[index] = value;
      return { ...current, [field]: nextValues };
    });
  };

  const updateSpecificationField = (index, key, value) => {
    setForm((current) => {
      const nextSpecifications = [...current.specifications];
      nextSpecifications[index] = { ...nextSpecifications[index], [key]: value };
      return { ...current, specifications: nextSpecifications };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        categoryId: Number(form.categoryId),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        images: form.images.filter(Boolean).map((imageUrl) => ({ imageUrl })),
        features: form.features.filter(Boolean).map((featureText) => ({ featureText })),
        specifications: form.specifications
          .filter((item) => item.key && item.value)
          .map((item) => ({ key: item.key, value: item.value })),
        tags: form.searchKeywords
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (isEditing) {
        await API.put(`/products/${id}`, payload);
      } else {
        await API.post('/products', payload);
      }

      toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully.`);
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-[520px] rounded-[32px] skeleton" />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950">
          <FiArrowLeft />
          Back to products
        </Link>
        <h2 className="mt-4 text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {isEditing ? 'Edit product' : 'Add product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Core details
            </h3>
            <div className="mt-6 grid gap-4">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Product name" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" required />
              <input value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} placeholder="Short description" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={6} placeholder="Long description" className="rounded-[28px] border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} placeholder="Brand" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" required />
                <input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} placeholder="SKU" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" required />
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Pricing and inventory
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" required />
              <input type="number" value={form.compareAtPrice} onChange={(event) => setForm((current) => ({ ...current, compareAtPrice: event.target.value }))} placeholder="Compare at price" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
              <input type="number" value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))} placeholder="Stock quantity" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" required />
              <input type="number" value={form.lowStockThreshold} onChange={(event) => setForm((current) => ({ ...current, lowStockThreshold: event.target.value }))} placeholder="Low stock threshold" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
              <select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500" required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <input value={form.warranty} onChange={(event) => setForm((current) => ({ ...current, warranty: event.target.value }))} placeholder="Warranty" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
              <input value={form.searchKeywords} onChange={(event) => setForm((current) => ({ ...current, searchKeywords: event.target.value }))} placeholder="Search keywords separated by commas" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 sm:col-span-2" />
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))} className="h-4 w-4 rounded" />
                Featured product
              </label>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 rounded" />
                Active in storefront
              </label>
            </div>
          </section>
        </div>

        <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Media and highlights
          </h3>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Images</p>
              {form.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <input value={image} onChange={(event) => updateListField('images', index, event.target.value)} placeholder="Image URL" className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
                  <button type="button" onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, itemIndex) => itemIndex !== index) || [''] }))} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setForm((current) => ({ ...current, images: [...current.images, ''] }))} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <FiPlusCircle />
                Add image
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Feature bullets</p>
              {form.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input value={feature} onChange={(event) => updateListField('features', index, event.target.value)} placeholder="Feature" className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
                  <button type="button" onClick={() => setForm((current) => ({ ...current, features: current.features.filter((_, itemIndex) => itemIndex !== index) || [''] }))} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setForm((current) => ({ ...current, features: [...current.features, ''] }))} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <FiPlusCircle />
                Add feature
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Specifications
          </h3>
          <div className="mt-6 space-y-3">
            {form.specifications.map((specification, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input value={specification.key} onChange={(event) => updateSpecificationField(index, 'key', event.target.value)} placeholder="Specification key" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
                <input value={specification.value} onChange={(event) => updateSpecificationField(index, 'value', event.target.value)} placeholder="Specification value" className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500" />
                <button type="button" onClick={() => setForm((current) => ({ ...current, specifications: current.specifications.filter((_, itemIndex) => itemIndex !== index) || [{ key: '', value: '' }] }))} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50">
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setForm((current) => ({ ...current, specifications: [...current.specifications, { key: '', value: '' }] }))} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <FiPlusCircle />
              Add specification
            </button>
          </div>
        </section>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
          <FiSave />
          {saving ? 'Saving...' : isEditing ? 'Update product' : 'Create product'}
        </button>
      </form>
    </div>
  );
}
