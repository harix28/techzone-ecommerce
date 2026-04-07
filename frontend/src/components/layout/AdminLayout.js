import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiMenu, FiX, FiLogOut, FiExternalLink, FiChevronRight, FiSettings
} from 'react-icons/fi';
import { MdElectricBolt } from 'react-icons/md';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: FiHome },
  { label: 'Products', href: '/admin/products', icon: FiPackage },
  { label: 'Orders', href: '/admin/orders', icon: FiShoppingBag },
  { label: 'Users', href: '/admin/users', icon: FiUsers },
  { label: 'Categories', href: '/admin/categories', icon: FiTag },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <MdElectricBolt className="text-white text-lg" />
            </div>
            <div>
              <span className="font-bold text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                TechZone
              </span>
              <span className="block text-xs text-gray-400 -mt-0.5">Admin Panel</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">Main Menu</p>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href));
            return (
              <Link key={href} to={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
                {isActive && <FiChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <Link to="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
            <FiExternalLink size={18} />
            <span className="text-sm font-medium">View Store</span>
          </Link>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all w-full">
            <FiLogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
            <FiMenu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {navItems.find(n => n.href === location.pathname)?.label || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-sm text-gray-500">Logged in as <strong>{user?.name}</strong></span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}