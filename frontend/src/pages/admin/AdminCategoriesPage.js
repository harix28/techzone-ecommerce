import { useEffect, useState } from 'react';
import { FiEdit, FiGrid, FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../../utils/api';

const emptyCategoryForm = {
  name: '',
  slug: '',
  icon: '',
  description: '',
  displayOrder: '0',
  isActive: true,
};

const getCategoryMonogram = (category) => {
  if (category.icon) {
    return category.icon;
  }

  return String(category.name || 'TZ')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyCategoryForm);

  const loadCategories = async () => {
    setLoading(true);

    try {
      const response = await API.get('/categories', {
        params: { includeInactive: true },
      });
      setCategories(extractApiData(response));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setForm(emptyCategoryForm);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(emptyCategoryForm);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      icon: category.icon || '',
      description: category.description || '',
      displayOrder: String(category.displayOrder ?? 0),
      isActive: Boolean(category.isActive),
    });
    setModalOpen(true);
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        displayOrder: Number(form.displayOrder || 0),
      };

      if (editingCategory) {
        await API.put(`/categories/${editingCategory.id}`, payload);
      } else {
        await API.post('/categories', payload);
      }

      toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully.`);
      closeModal();
      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveCategory = async (categoryId) => {
    try {
      await API.delete(`/categories/${categoryId}`);
      toast.success('Category archived successfully.');
      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to archive category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Categories
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Organize the catalog into storefront-ready product groups.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiPlusCircle />
            Add category
          </button>
        </div>
      </div>

      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                <th className="pb-4">Category</th>
                <th className="pb-4">Slug</th>
                <th className="pb-4">Description</th>
                <th className="pb-4">Order</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
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
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                          {getCategoryMonogram(category)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{category.name}</p>
                          <p className="text-sm text-slate-500">
                            {category.icon ? `Icon ${category.icon}` : 'Fallback initials enabled'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-slate-700">{category.slug}</td>
                    <td className="py-4 text-slate-600">
                      {category.description || 'No description added'}
                    </td>
                    <td className="py-4 text-slate-600">{category.displayOrder}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                        category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {category.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(category)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        >
                          <FiEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveCategory(category.id)}
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
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-[36px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Catalog</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {editingCategory ? 'Edit category' : 'Create category'}
                </h3>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                <FiGrid />
              </div>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Category name"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                  required
                />
                <input
                  value={form.slug}
                  onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="Slug (optional)"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <input
                  value={form.icon}
                  onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
                  placeholder="Icon or emoji"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) => setForm((current) => ({ ...current, displayOrder: event.target.value }))}
                  placeholder="Display order"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                placeholder="Short category description"
                className="w-full rounded-[28px] border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />

              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                Show this category in the storefront
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <FiPlusCircle />
                  {saving ? 'Saving...' : editingCategory ? 'Save changes' : 'Create category'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
