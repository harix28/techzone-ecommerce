import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Shop Pages
import StorefrontLayout from './components/layout/StorefrontLayout';
import StoreHomePage from './pages/shop/StoreHomePage';
import CatalogPage from './pages/shop/CatalogPage';
import StoreProductDetailPage from './pages/shop/StoreProductDetailPage';
import StoreCartPage from './pages/shop/StoreCartPage';
import StoreCheckoutPage from './pages/shop/StoreCheckoutPage';
import StoreWishlistPage from './pages/shop/StoreWishlistPage';
import StoreOrdersPage from './pages/shop/StoreOrdersPage';
import StoreOrderDetailPage from './pages/shop/StoreOrderDetailPage';
import StoreProfilePage from './pages/shop/StoreProfilePage';
import StoreLoginPage from './pages/shop/StoreLoginPage';
import StoreRegisterPage from './pages/shop/StoreRegisterPage';

// Admin Pages
import AdminShellLayout from './components/layout/AdminShellLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductEditorPage from './pages/admin/AdminProductEditorPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';

const ProtectedRoute = ({ children }) => {
  const { user, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <div className="min-h-[40vh] animate-pulse rounded-3xl bg-slate-100" />;
  }

  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <div className="min-h-[40vh] animate-pulse rounded-3xl bg-slate-100" />;
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '16px', background: '#07111f', color: '#f8fafc' },
              }}
            />
            <Routes>
              <Route path="/" element={<StorefrontLayout />}>
                <Route index element={<StoreHomePage />} />
                <Route path="products" element={<CatalogPage />} />
                <Route path="products/:id" element={<StoreProductDetailPage />} />
                <Route path="cart" element={<StoreCartPage />} />
                <Route path="wishlist" element={<ProtectedRoute><StoreWishlistPage /></ProtectedRoute>} />
                <Route path="login" element={<StoreLoginPage />} />
                <Route path="register" element={<StoreRegisterPage />} />
                <Route path="checkout" element={<ProtectedRoute><StoreCheckoutPage /></ProtectedRoute>} />
                <Route path="orders" element={<ProtectedRoute><StoreOrdersPage /></ProtectedRoute>} />
                <Route path="orders/:id" element={<ProtectedRoute><StoreOrderDetailPage /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><StoreProfilePage /></ProtectedRoute>} />
              </Route>

              <Route path="/admin" element={<AdminRoute><AdminShellLayout /></AdminRoute>}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductEditorPage />} />
                <Route path="products/:id/edit" element={<AdminProductEditorPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
