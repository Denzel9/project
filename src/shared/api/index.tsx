import { QueryClient } from '@tanstack/react-query';
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { useAuthStore } from '@/features/auth';
import { mapAuthSessionUser } from '@/features/auth/model/utils/mapAuthSessionUser';
import type { AuthResponse } from '@/features/auth/model/types/types';

import { ROUTES } from '../config/routes';

type RetryAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

export const queryClient = new QueryClient();

export const mainAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL_BACKEND,
  withCredentials: true,
});

let refreshPromise: Promise<AuthResponse> | null = null;

const isAuthRefreshUrl = (url?: string) =>
  Boolean(url && url.includes('/auth/refresh'));

const redirectToAuth = (failedRequestUrl?: string) => {
  if (typeof window === 'undefined') return;

  const path = window.location.pathname;
  if (path === ROUTES.AUTH || path.startsWith(`${ROUTES.AUTH}/`)) return;

  if (failedRequestUrl?.includes('invites/accept')) {
    const token = new URLSearchParams(window.location.search).get('token');
    window.location.href = token
      ? `${ROUTES.AUTH}?isAuthFailed=true&token=${encodeURIComponent(token)}`
      : `${ROUTES.AUTH}?isAuthFailed=true`;
    return;
  }

  window.location.href = ROUTES.AUTH;
};

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = mainAxios
      .post<AuthResponse>('/auth/refresh', undefined, {
        withCredentials: true,
        _skipAuthRefresh: true,
      } as RetryAxiosRequestConfig)
      .then(response => {
        const user = response.data?.user;
        if (!user) {
          throw new Error('Refresh response without user');
        }

        useAuthStore.getState().setAuth(mapAuthSessionUser(user));
        return response.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

mainAxios.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const shouldTryRefresh =
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh &&
      !isAuthRefreshUrl(originalRequest.url);

    if (!shouldTryRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return mainAxios(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().removeAuth();
      redirectToAuth(originalRequest.url);
      return Promise.reject(refreshError);
    }
  },
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
