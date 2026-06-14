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

  const handleSuccessLogin = async () => {
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

  const handleSuccessRecoveryPassword = () => {
    setIsRecoveryPassword(false);
    setSnackbar({
      isOpen: true,
      message: 'Ссылка для восстановления пароля отправлена на вашу почту',
    });
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
          height: '100%',
          display: 'flex',
          p: { xs: 2, md: 4 },
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          width: { xs: '100%', md: '50%' },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '16px', md: '32px' },
            left: { xs: '16px', md: '32px' },
            right: { xs: '16px', md: '32px' },
          }}
        >
          <Typography
            variant="h3"
            sx={{ mb: 1 }}
          >
            LOGO
          </Typography>

          <Typography
            color="info"
            sx={{ mb: 4 }}
            variant="body1"
          >
            Лучший способ создавать и управлять своим контентом
          </Typography>
        </Box>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            mt: { xs: '20%', md: 0 },
          }}
        >
          {token && !isAuthFailed && <ResetPasswordForm />}

          {token && isAuthFailed && (
            <LoginForm
              onError={setSnackbar}
              onSuccess={handleSuccessLogin}
            />
          )}

          {isRecoveryPassword && (
            <RecoveryPasswordForm
              onError={setSnackbar}
              onSuccess={handleSuccessRecoveryPassword}
              onBackToLogin={() => setIsRecoveryPassword(false)}
            />
          )}

          {!token && !isRecoveryPassword && (
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              {isResetPassword && (
                <Typography
                  variant="h6"
                  color="info"
                >
                  Пароль успешно изменен! Войдите в систему
                </Typography>
              )}

              <AuthForms
                onError={setSnackbar}
                onRecoveryPassword={() => setIsRecoveryPassword(true)}
              />
            </Box>
          )}

          {!token && !isRecoveryPassword && (
            <Box sx={{ mt: 2, width: { xs: '100%', md: '50%' } }}>
              <Divider sx={{ mb: 2 }}>
                <Typography
                  variant="body1"
                  color="info"
                >
                  или
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
              >
                Войти с Google
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          width: '50%',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: { xs: 'none', md: 'block' },
          backgroundImage: `url('main-bg.jpg')`,
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
