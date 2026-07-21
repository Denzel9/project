import { Box, CircularProgress } from '@mui/material';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { prefetchUserConfig } from '@/entities/user-config';
import { useAuthStore, useRefreshTokenMutation } from '@/features/auth';
import { queryClient } from '@/shared/api';
import { ROUTES } from '@/shared/config/routes';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { mutateAsync: refreshToken } = useRefreshTokenMutation();

  const { setAuth, removeAuth } = useAuthStore();

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const hasFetched = useRef(false);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

    hasFetched.current = true;

    const fetchToken = async () => {
      if (pathname === ROUTES.AUTH || pathname === ROUTES.INVITE) {
        setIsInitialized(true);
        return;
      }

      try {
        const res = await refreshToken();

        if (res?.data?.user) {
          setAuth(
            res.data.user.id,
            res.data.user.role,
            res.data.user.membershipRole
          );

          try {
            await prefetchUserConfig(queryClient);
          } catch {
            // Конфиг не критичен для старта приложения
          }

          return;
        }

        removeAuth();
        navigate(ROUTES.AUTH);
      } catch {
        removeAuth();
        navigate(ROUTES.AUTH);
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
