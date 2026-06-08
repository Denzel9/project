import { Box, Button, Divider, Snackbar, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useAcceptInviteMutation } from '@/entities/workspace-member';
import {
  AuthForms,
  LoginForm,
  RecoveryPasswordForm,
  ResetPasswordForm,
} from '@/features/auth';
import { ROUTES } from '@/shared';

export const AuthPage = () => {
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
  });
  const [isRecoveryPassword, setIsRecoveryPassword] = useState(false);

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const isAuthFailed = searchParams.get('isAuthFailed');
  const isResetPassword = searchParams.get('isResetPassword');

  const { mutateAsync: acceptInvite } = useAcceptInviteMutation();

  const navigate = useNavigate();

  const handleSuccess = async () => {
    if (token) {
      const res = await acceptInvite(token);

      if (res?.data) {
        navigate(ROUTES.INDEX, { replace: true });
      } else {
        setSnackbar({
          isOpen: true,
          message: 'Неверный токен',
        });
      }
    } else {
      navigate(ROUTES.INDEX, { replace: true });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        p: 4,
        gap: 4,
        backgroundColor: 'white',
      }}
    >
      <Box
        sx={{
          width: '35%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          display: 'flex',
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{ mb: 4 }}
          >
            LOGO
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4 }}
          >
            Лучший способ создавать и управлять своим контентом
          </Typography>

          {token && !isAuthFailed && <ResetPasswordForm />}

          {token && isAuthFailed && (
            <Box sx={{ mt: '50%', transform: 'translateY(-50%)' }}>
              <LoginForm
                onSuccess={handleSuccess}
                onError={() =>
                  setSnackbar({
                    isOpen: true,
                    message: 'Неверный логин или пароль',
                  })
                }
              />
            </Box>
          )}

          {isRecoveryPassword && (
            <Box sx={{ mt: '50%', transform: 'translateY(-50%)' }}>
              <RecoveryPasswordForm
                onBackToLogin={() => setIsRecoveryPassword(false)}
                onSuccess={() => {
                  setIsRecoveryPassword(false);
                  setSnackbar({
                    isOpen: true,
                    message:
                      'Ссылка для восстановления пароля отправлена на вашу почту',
                  });
                }}
              />
            </Box>
          )}
        </Box>

        {!token && !isRecoveryPassword && (
          <Box>
            {isResetPassword && (
              <Typography variant="h6">
                Пароль успешно изменен! Войдите в систему
              </Typography>
            )}

            <AuthForms
              onError={() =>
                setSnackbar({
                  isOpen: true,
                  message: 'Неверный логин или пароль',
                })
              }
              onRecoveryPassword={() => setIsRecoveryPassword(true)}
            />
          </Box>
        )}

        {!token && !isRecoveryPassword && (
          <Box>
            <Divider sx={{ mb: 2 }}>или</Divider>
            <Button
              variant="contained"
              fullWidth
            >
              Войти с Google
            </Button>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          backgroundImage: `url('auth.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '65%',
          height: `calc(100vh - 64px)`,
          borderTopLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      />

      <Snackbar
        open={snackbar.isOpen}
        autoHideDuration={6000}
        message={snackbar.message}
        onClose={() => setSnackbar({ isOpen: false, message: '' })}
      />
    </Box>
  );
};

export default AuthPage;
