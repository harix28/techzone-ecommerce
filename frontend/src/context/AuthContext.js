import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { clearStoredSession, getStoredSession, setStoredSession } from '../utils/authStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => getStoredSession());
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  const persistSession = useCallback((payload) => {
    if (!payload) {
      clearStoredSession();
      setSession(null);
      return;
    }

    setStoredSession(payload);
    setSession(payload);
  }, []);

  useEffect(() => {
    const syncSession = () => setSession(getStoredSession());
    window.addEventListener('techzone:auth-changed', syncSession);

    API.get('/auth/me')
      .then((response) => {
        const user = response.data?.data;
        const currentSession = getStoredSession();

        if (user && currentSession?.accessToken) {
          persistSession({
            user,
            accessToken: currentSession.accessToken,
          });
        }
      })
      .catch(() => {})
      .finally(() => setBootstrapping(false));

    return () => window.removeEventListener('techzone:auth-changed', syncSession);
  }, [persistSession]);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const response = await API.post('/auth/login', { email, password });
        const payload = response.data?.data;
        persistSession(payload);
        toast.success(`Welcome back, ${payload.user.name}!`);
        return payload;
      } catch (error) {
        toast.error(error.response?.data?.message || 'Login failed');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistSession],
  );

  const register = useCallback(
    async (name, email, password) => {
      setLoading(true);
      try {
        const response = await API.post('/auth/register', { name, email, password });
        const payload = response.data?.data;
        persistSession(payload);
        toast.success('Account created successfully!');
        return payload;
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistSession],
  );

  const refreshUser = useCallback(async () => {
    const response = await API.get('/users/profile');
    const profile = response.data?.data;
    const currentSession = getStoredSession();

    if (profile && currentSession?.accessToken) {
      persistSession({
        user: profile,
        accessToken: currentSession.accessToken,
      });
    }

    return profile;
  }, [persistSession]);

  const logout = useCallback(() => {
    API.post('/auth/logout').catch(() => {});
    persistSession(null);
    toast.success('Logged out successfully');
  }, [persistSession]);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        accessToken: session?.accessToken || '',
        loading,
        bootstrapping,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: session?.user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
