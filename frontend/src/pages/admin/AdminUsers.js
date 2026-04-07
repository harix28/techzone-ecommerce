import { useState, useEffect } from 'react';
import { FiShield, FiSlash, FiCheck } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/users?page=${page}&limit=20`);
      setUsers(data.users);
      setPages(data.pages);
      setTotal(data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const toggleRole = async (user) => {
    if (user._id === currentUser._id) return toast.error("Can't change your own role");
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setUpdating(user._id + '-role');
    try {
      await API.put(`/users/${user._id}`, { role: newRole, isActive: user.isActive });
      toast.success(`User is now ${newRole}`);
      fetchUsers();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const toggleActive = async (user) => {
    if (user._id === currentUser._id) return toast.error("Can't suspend yourself");
    setUpdating(user._id + '-active');
    try {
      await API.put(`/users/${user._id}`, { role: user.role, isActive: !user.isActive });
      toast.success(user.isActive ? 'User suspended' : 'User activated');
      fetchUsers();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Users</h1>
          <p className="text-sm text-gray-500">{total} registered users</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 skeleton rounded" /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No users found</td></tr>
              ) : users.map(user => (
                <tr key={user._id} className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        {user._id === currentUser._id && <span className="text-xs text-blue-600 font-medium">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className={`badge ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    {user._id !== currentUser._id && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleRole(user)} disabled={!!updating}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                          <FiShield size={12} className={user.role === 'admin' ? 'text-purple-500' : 'text-gray-400'} />
                          {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                        <button onClick={() => toggleActive(user)} disabled={!!updating}
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-lg transition-colors disabled:opacity-50 ${
                            user.isActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-500 hover:bg-green-50'
                          }`}>
                          {user.isActive ? (<><FiSlash size={12} /> Suspend</>) : (<><FiCheck size={12} /> Activate</>)}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
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