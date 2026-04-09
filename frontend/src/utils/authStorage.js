const STORAGE_KEY = 'techzone_session';

const emitChange = () => {
  window.dispatchEvent(new Event('techzone:auth-changed'));
};

export const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch (error) {
    return null;
  }
};

export const setStoredSession = (session) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  emitChange();
};

export const clearStoredSession = () => {
  localStorage.removeItem(STORAGE_KEY);
  emitChange();
};

export const getAccessToken = () => getStoredSession()?.accessToken || '';
