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
import { ROUTES } from '@/shared';
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
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          p: { xs: 2, md: 4 },
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            alignSelf: 'start',
          }}
        >
          <img
            src="./Primary.png"
            alt="auth-background"
          />

          <Typography
            color="info"
            sx={{ mt: 1 }}
            variant="body1"
          >
            Лучший способ создавать и управлять своим контентом
          </Typography>
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: 500,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
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
          sx={{ alignSelf: 'start', width: '100%' }}
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
