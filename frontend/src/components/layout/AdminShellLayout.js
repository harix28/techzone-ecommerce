import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { MdElectricBolt } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Overview', href: '/admin', icon: FiHome },
  { label: 'Products', href: '/admin/products', icon: FiPackage },
  { label: 'Orders', href: '/admin/orders', icon: FiShoppingBag },
  { label: 'Users', href: '/admin/users', icon: FiUsers },
  { label: 'Categories', href: '/admin/categories', icon: FiGrid },
  { label: 'Coupons', href: '/admin/coupons', icon: FiTag },
];

export default function AdminShellLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const currentItem = navItems.find((item) =>
      item.href === '/admin'
        ? location.pathname === '/admin'
        : location.pathname.startsWith(item.href),
    );

    return currentItem?.label || 'Admin';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100">
      {sidebarOpen ? (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
        />
      ) : null}

      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 text-white transition md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/15 p-2.5 text-cyan-300">
                <MdElectricBolt className="text-2xl" />
              </div>
              <div>
                <p className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  TechZone
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Admin console
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white md:hidden"
            >
              <FiX />
            </button>
          </div>

          <div className="border-b border-slate-800 px-6 py-5">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
          </div>

          <nav className="space-y-2 px-4 py-6">
            {navItems.map(({ href, icon: Icon, label }) => (
              <NavLink
                key={href}
                to={href}
                onClick={() => setSidebarOpen(false)}
                end={href === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute inset-x-0 bottom-0 border-t border-slate-800 p-4">
            <Link
              to="/"
              className="mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <FiHome />
              View storefront
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-300 transition hover:bg-slate-900 hover:text-rose-200"
            >
              <FiLogOut />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
                >
                  <FiMenu />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Admin</p>
                  <h1 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {pageTitle}
                  </h1>
                </div>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Signed in as {user?.name}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
