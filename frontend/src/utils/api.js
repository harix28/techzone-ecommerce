import axios from 'axios';
import { clearStoredSession, getAccessToken, getStoredSession, setStoredSession } from './authStorage';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

let refreshPromise = null;

export const extractApiData = (response) => response?.data?.data;
export const extractApiMeta = (response) => response?.data?.meta;

API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const canRefresh =
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/register') &&
      !requestUrl.includes('/auth/refresh');

    if (canRefresh) {
      originalRequest._retry = true;

      try {
        refreshPromise =
          refreshPromise ||
          API.post('/auth/refresh')
            .then((response) => {
              const currentSession = getStoredSession();
              const payload = extractApiData(response);

              if (payload?.user && payload?.accessToken) {
                setStoredSession({
                  user: payload.user,
                  accessToken: payload.accessToken,
                });
              }

              return payload?.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });

        const accessToken = await refreshPromise;

        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        clearStoredSession();
      }
    }

    if (error.response?.status === 401) {
      clearStoredSession();
    }

    return Promise.reject(error);
  }
);

export default API;
