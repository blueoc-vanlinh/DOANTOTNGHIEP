import { BASE_URL } from '@/constants/config';
import { useAuthStore } from '@/store/auth.store';
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
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
        const refreshToken = useAuthStore.getState().refreshToken;
        const refreshResponse = await apiClient.post('/auth/refresh', refreshToken ? { refreshToken } : undefined);
        useAuthStore.getState().login(refreshResponse.data.user, {
          accessToken: refreshResponse.data.accessToken,
          refreshToken: refreshResponse.data.refreshToken,
        });
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem('auth-storage');
      }
    }

    if (status === 401) {
      if (window.location.pathname !== '/login') {
        useAuthStore.getState().logout();
      } else {
        localStorage.removeItem('auth-storage');
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
