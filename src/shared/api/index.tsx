import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useAuthStore } from '@/features/auth';

import { ROUTES } from '../config/routes';

export const queryClient = new QueryClient();

export const mainAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL_BACKEND,
  withCredentials: true,
});

mainAxios.interceptors.request.use(config => config);

mainAxios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      const refreshResult = await mainAxios.post('/auth/refresh', undefined, {
        withCredentials: true,
      });

      if (refreshResult) {
        await mainAxios({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
          },
        });

        useAuthStore
          .getState()
          .setAuth(
            refreshResult?.data?.user?.id,
            refreshResult?.data?.user?.role,
            refreshResult?.data?.user?.membershipRole
          );
      } else {
        if (originalRequest.url.includes('invites/accept')) {
          window.location.href = `${ROUTES.AUTH}?isAuthFailed=true&token=${window.location.search.split('=')[1]}`;
        } else {
          window.location.href = ROUTES.AUTH;
        }
      }
    }

    return Promise.reject(error);
  }
);

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
      retryDelay: attempt => Math.min(attempt * 1000, 3000),
    },
  },
});
