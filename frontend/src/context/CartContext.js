import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });

  const saveCart = (newItems) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      let newItems;
      if (existing) {
        newItems = prev.map(i => i._id === product._id
          ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
          : i
        );
        toast.success('Cart updated!');
      } else {
        newItems = [...prev, { ...product, quantity: qty }];
        toast.success(`${product.name} added to cart!`);
      }
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => {
      const newItems = prev.filter(i => i._id !== id);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
    toast.success('Item removed from cart');
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => {
      const newItems = prev.map(i => i._id === id ? { ...i, quantity: qty } : i);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};