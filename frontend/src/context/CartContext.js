import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../utils/api';
import { useAuth } from './AuthContext';
import { getProductImage } from '../utils/catalog';

const CartContext = createContext();
const GUEST_CART_KEY = 'techzone_guest_cart';

const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
  } catch (error) {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState(() => getGuestCart());
  const [loading, setLoading] = useState(false);

  const saveGuestCart = (newItems) => {
    setItems(newItems);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
  };

  useEffect(() => {
    if (!user) {
      setItems(getGuestCart());
      return;
    }

    setLoading(true);
    const syncGuestCart = async () => {
      const guestCart = getGuestCart();

      if (guestCart.length > 0) {
        for (const item of guestCart) {
          await API.post('/cart/items', { productId: item.productId, quantity: item.quantity });
        }
        localStorage.removeItem(GUEST_CART_KEY);
      }

      const response = await API.get('/cart');
      setItems(extractApiData(response).items || []);
    };

    syncGuestCart()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addItem = useCallback(
    async (product, qty = 1) => {
      if (user) {
        try {
          const response = await API.post('/cart/items', { productId: product.id || product.productId, quantity: qty });
          setItems(extractApiData(response).items || []);
          toast.success(`${product.name} added to cart`);
          return;
        } catch (error) {
          toast.error(error.response?.data?.message || 'Unable to update cart');
          throw error;
        }
      }

      const productId = product.id || product.productId;
      saveGuestCart(
        (() => {
          const existing = items.find((item) => item.productId === productId);

          if (existing) {
            return items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.min(item.quantity + qty, product.stockQuantity || product.stock || 999) }
                : item,
            );
          }

          return [
            ...items,
            {
              productId,
              name: product.name,
              slug: product.slug,
              brand: product.brand,
              price: product.price,
              quantity: qty,
              stockQuantity: product.stockQuantity || product.stock || 999,
              imageUrl: getProductImage(product),
            },
          ];
        })(),
      );
      toast.success(`${product.name} added to cart`);
    },
    [items, user],
  );

  const removeItem = useCallback(
    async (productId) => {
      if (user) {
        const response = await API.delete(`/cart/items/${productId}`);
        setItems(extractApiData(response).items || []);
      } else {
        saveGuestCart(items.filter((item) => item.productId !== productId));
      }

      toast.success('Item removed from cart');
    },
    [items, user],
  );

  const updateQty = useCallback(
    async (productId, qty) => {
      if (qty < 1) return;

      if (user) {
        const response = await API.put(`/cart/items/${productId}`, { quantity: qty });
        setItems(extractApiData(response).items || []);
        return;
      }

      saveGuestCart(items.map((item) => (item.productId === productId ? { ...item, quantity: qty } : item)));
    },
    [items, user],
  );

  const clearCart = useCallback(async () => {
    if (user) {
      const response = await API.delete('/cart');
      setItems(extractApiData(response).items || []);
      return;
    }

    setItems([]);
    localStorage.removeItem(GUEST_CART_KEY);
  }, [user]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
