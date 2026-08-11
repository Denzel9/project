import { Box, Link, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { BASE_COLOR } from '@/app/index';
import { useAcceptInviteMutation } from '@/entities/workspace-member';
import {
  AuthForms,
  LoginForm,
  RecoveryPasswordForm,
  ResetPasswordForm,
} from '@/features';
import { ROUTES, SAFE_AREA } from '@/shared';
import { useSnackbarStore } from '@/widgets';

export const AuthPage = () => {
  const { setSnackbarOpen } = useSnackbarStore();
  const [isRecoveryPassword, setIsRecoveryPassword] = useState(false);

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const isAuthFailed = searchParams.get('isAuthFailed');
  const isResetPassword = searchParams.get('isResetPassword');
  const emailConfirmed = searchParams.get('emailConfirmed');

  const { mutateAsync: acceptInvite } = useAcceptInviteMutation();

  const navigate = useNavigate();

  const handleSuccessLogin = async () => {
    if (token) {
      const res = await acceptInvite(token);

      if (res?.data) {
        navigate(ROUTES.INDEX, { replace: true });
      } else {
        setSnackbarOpen?.(true, 'Неверный токен');
      }
    } else {
      navigate(ROUTES.INDEX, { replace: true });
    }
  };

  const handleSuccessRecoveryPassword = () => {
    setIsRecoveryPassword(false);
    setSnackbarOpen?.(
      true,
      'Ссылка для восстановления пароля отправлена на вашу почту'
    );
  };

  return (
    <Box
      sx={{
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        boxSizing: 'border-box',
        pt: SAFE_AREA.top,
        pb: SAFE_AREA.bottom,
        pl: SAFE_AREA.left,
        pr: SAFE_AREA.right,
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          display: 'flex',
          p: { xs: 2, md: 4 },
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="column"
          spacing={1}
          sx={{
            alignSelf: 'start',
          }}
        >
          <img
            src="./Primary.png"
            alt="auth-background"
            width={250}
            height={50}
          />

          <Typography
            color="info"
            variant="caption"
            sx={{ width: { xs: 230, md: 'auto' } }}
          >
            Лучший способ создавать и управлять своим контентом
          </Typography>
        </Stack>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            maxWidth: 500,
            display: 'flex',
            overflowY: 'auto',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {token && !isAuthFailed && <ResetPasswordForm />}
          {token && isAuthFailed && (
            <LoginForm
              onError={setSnackbarOpen}
              onSuccess={handleSuccessLogin}
            />
          )}
          {isRecoveryPassword && (
            <RecoveryPasswordForm
              onError={setSnackbarOpen}
              onSuccess={handleSuccessRecoveryPassword}
              onBackToLogin={() => setIsRecoveryPassword(false)}
            />
          )}

          {!token && !isRecoveryPassword && (
            <Box sx={{ width: '100%' }}>
              {isResetPassword && (
                <Typography
                  variant="h6"
                  color="info"
                >
                  Пароль успешно изменен! Войдите в систему
                </Typography>
              )}

              {emailConfirmed && (
                <Typography
                  variant="h6"
                  color="info"
                  sx={{ mb: 2 }}
                >
                  Почта подтверждена! Войдите в систему
                </Typography>
              )}

              <AuthForms
                onError={setSnackbarOpen}
                onRecoveryPassword={() => setIsRecoveryPassword(true)}
              />
            </Box>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={4}
          sx={{ alignSelf: 'start', width: '100%', display: { xs: 'none', md: 'flex' } }}
        >
          <Typography
            variant="body2"
            color="white"
          >
            NIKSSENSES © 2026
          </Typography>

          <Link
            href="/help"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              transition: 'color 0.2s ease',
              '&:hover': { color: BASE_COLOR },
            }}
          >
            <Typography variant="body2">Корпоративный сайт</Typography>
          </Link>

          <Link
            href="/help"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              transition: 'color 0.2s ease',
              '&:hover': { color: BASE_COLOR },
            }}
          >
            <Typography variant="body2">Помощь</Typography>
          </Link>
        </Stack>
      </Box>
    </Box>
  );
};

export default AuthPage;
