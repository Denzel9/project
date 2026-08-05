import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import {
  mapAuthSessionUser,
  useAuthStore,
  useConfirmEmailMutation,
  useRefreshTokenMutation,
} from '@/features/auth';
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

export const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setSnackbarOpen } = useSnackbarStore();
  const { isAuth, setAuth } = useAuthStore();
  const { mutateAsync: confirmEmail } = useConfirmEmailMutation();
  const { mutateAsync: refreshToken } = useRefreshTokenMutation();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      if (!token) {
        setSnackbarOpen?.(true, 'Ссылка подтверждения недействительна');
        navigate(isAuth ? ROUTES.SETTINGS_GENERAL : ROUTES.AUTH, {
          replace: true,
        });
        return;
      }

      try {
        const { data } = await confirmEmail({ token });
        setSnackbarOpen?.(true, data.message || 'Почта успешно подтверждена');

        if (isAuth) {
          try {
            const refreshed = await refreshToken();
            if (refreshed?.data?.user) {
              setAuth(mapAuthSessionUser(refreshed.data.user));
            } else {
              useAuthStore.setState({ isEmailConfirmed: true });
            }
          } catch {
            useAuthStore.setState({ isEmailConfirmed: true });
          }

          navigate(ROUTES.SETTINGS_GENERAL, { replace: true });
          return;
        }

        navigate(
          { pathname: ROUTES.AUTH, search: '?emailConfirmed=true' },
          { replace: true }
        );
      } catch {
        setSnackbarOpen?.(true, 'Недействительный или просроченный токен');
        navigate(isAuth ? ROUTES.SETTINGS_GENERAL : ROUTES.AUTH, {
          replace: true,
        });
      }
    };

    void run();
  }, [
    confirmEmail,
    isAuth,
    navigate,
    refreshToken,
    setAuth,
    setSnackbarOpen,
    token,
  ]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress />
      <Typography color="info">Подтверждаем почту…</Typography>
    </Box>
  );
};

export default ConfirmEmailPage;
