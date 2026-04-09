import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData, extractApiMeta } from '../../utils/api';
import { formatDate } from '../../utils/format';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await API.get('/users', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
        },
      });
      setUsers(extractApiData(response));
      setMeta(extractApiMeta(response));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const handleToggle = async (user, field) => {
    try {
      await API.put(`/users/${user.id}`, {
        roleKey: field === 'role'
          ? user.role === 'admin' ? 'customer' : 'admin'
          : user.role,
        isActive: field === 'active' ? !user.isActive : user.isActive,
      });
      toast.success('User updated successfully.');
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Users
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Search customers, promote admins, and manage account status.
        </p>
        <div className="mt-6 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search users by name or email"
              className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                <th className="pb-4">User</th>
                <th className="pb-4">Phone</th>
                <th className="pb-4">Role</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Joined</th>
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
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </td>
                    <td className="py-4 text-slate-600">{user.phone || 'Not set'}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                        user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                        user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleToggle(user, 'role')} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                          {user.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button type="button" onClick={() => handleToggle(user, 'active')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          user.isActive
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}>
                          {user.isActive ? 'Suspend' : 'Activate'}
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
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
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
                    page === nextPage ? 'bg-slate-950 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {nextPage}
                </button>
              );
            })}
            <button type="button" onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))} disabled={page >= meta.totalPages} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
