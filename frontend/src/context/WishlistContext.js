import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    API.get('/wishlist')
      .then((response) => setItems(extractApiData(response)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please sign in to use your wishlist');
      return;
    }

    try {
      const response = await API.post(`/wishlist/${productId}`);
      setItems(extractApiData(response));
      return extractApiData(response);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Wishlist update failed');
      throw error;
    }
  };

  const hasItem = (productId) => items.some((item) => item.productId === productId);
  const value = useMemo(
    () => ({
      items,
      loading,
      count: items.length,
      toggleWishlist,
      hasItem,
    }),
    [items, loading],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }

  return context;
};
