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
          p: 4,
          width: '50%',
          height: '100%',
        }}
      >
        <Typography
          variant="h3"
          sx={{ mb: 1 }}
        >
          LOGO
        </Typography>

        <Typography
          variant="body1"
          color="info"
          sx={{ mb: 4 }}
        >
          Лучший способ создавать и управлять своим контентом
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <Box
            sx={{
              width: '60%',
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
              <Box>
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
              <Box sx={{ mt: 2 }}>
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
      </Box>

      <Box
        sx={{
          width: '50%',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
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
