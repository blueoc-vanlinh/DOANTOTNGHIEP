import { BASE_URL } from '@/constants/config';
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 1000 * 60 * 30 * 3,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (config.url?.includes('/auth/login')) {
      return config;
    }

    try {
      const storage = localStorage.getItem('auth-storage');
      const token = JSON.parse(storage || '{}')?.state?.accessToken;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Token parse error:', e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('auth-storage');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject({
      message:
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Something went wrong',
      code: status,
      data: error?.response?.data,
    });
  }
);

export default apiClient;
