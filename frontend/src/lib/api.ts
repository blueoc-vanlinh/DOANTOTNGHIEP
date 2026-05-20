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
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;
    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await apiClient.post('/auth/refresh');
        const storage = localStorage.getItem('auth-storage');
        const state = JSON.parse(storage || '{}')?.state || {};
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({
            state: {
              ...state,
              user: refreshResponse.data.user,
              isAuthenticated: true,
            },
            version: 0,
          })
        );
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem('auth-storage');
      }
    }

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
