import { Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { prefetchUserConfig } from '@/entities/user-config';
import {
  mapAuthSessionUser,
  subscribeRemoteProfileSwitch,
  useAuthStore,
  useRefreshTokenMutation,
} from '@/features/auth';
import type { AuthSessionUser } from '@/features/auth/model/types/types';
import { queryClient } from '@/shared/api';
import { ROUTES } from '@/shared/config/routes';

const AUTH_REFRESH_RETRY_DELAY_MS = 600;

const isAuthFailureStatus = (status?: number) =>
  status === 401 || status === 403;

const getErrorStatus = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { mutateAsync: refreshToken } = useRefreshTokenMutation();

  const { setAuth, removeAuth } = useAuthStore();

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const hasFetched = useRef(false);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    return subscribeRemoteProfileSwitch();
  }, []);

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

    hasFetched.current = true;

    const forceLogout = () => {
      removeAuth();
      navigate(ROUTES.AUTH);
    };

    const applySession = async (user: AuthSessionUser) => {
      setAuth(mapAuthSessionUser(user));

      try {
        await prefetchUserConfig(queryClient);
      } catch {
        // Конфиг не критичен для старта приложения
      }
    };

    const fetchToken = async () => {
      const isPublicPath =
        pathname === ROUTES.AUTH ||
        pathname === ROUTES.AUTH_CONFIRM_EMAIL ||
        pathname === ROUTES.INVITE ||
        pathname === ROUTES.USER_AGREEMENT ||
        pathname === ROUTES.PRIVACY_POLICY;

      if (isPublicPath) {
        setIsInitialized(true);
        return;
      }

      try {
        const res = await refreshToken();

        if (res?.data?.user) {
          await applySession(res.data.user);
          return;
        }

        forceLogout();
      } catch (error) {
        // Явная потеря сессии — сразу на логин.
        if (isAuthFailureStatus(getErrorStatus(error))) {
          forceLogout();
          return;
        }

        // Сеть / 5xx (часто в PWA после сна) — один повтор, без мгновенного logout.
        try {
          await wait(AUTH_REFRESH_RETRY_DELAY_MS);
          const retryRes = await refreshToken();

          if (retryRes?.data?.user) {
            await applySession(retryRes.data.user);
            return;
          }
        } catch (retryError) {
          if (isAuthFailureStatus(getErrorStatus(retryError))) {
            forceLogout();
            return;
          }
        }

        forceLogout();
      } finally {
        setIsInitialized(true);
      }
    };

    void fetchToken();
  }, [pathname, refreshToken, setAuth, removeAuth, navigate]);

  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
};
