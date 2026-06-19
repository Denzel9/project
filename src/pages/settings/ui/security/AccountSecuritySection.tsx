import { Button, Stack, Switch, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { useGetUserByIdQuery } from '@/entities/user';
import { useAuthStore, useRecoveryPasswordMutation } from '@/features/auth';
import { useSnackbarStore } from '@/widgets';

import { SettingsRow } from '../SettingsRow';

export const AccountSecuritySection = () => {
  const userId = useAuthStore(state => state.id);
  const { data: user } = useGetUserByIdQuery(userId ?? '');

  const { mutateAsync: recoveryPassword, isPending } =
    useRecoveryPasswordMutation();
  const { setSnackbarOpen } = useSnackbarStore();

  const [email, setEmail] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);

  const userEmail = user?.data?.email ?? '';

  useEffect(() => {
    if (isOpenChangePassword && userEmail) {
      setTimeout(() => {
        setEmail(userEmail);
      }, 0);
    }
  }, [isOpenChangePassword, userEmail]);

  const handleOpenChangePassword = () => {
    setEmail(userEmail);
    setIsOpenChangePassword(true);
  };

  const handleBack = () => {
    setIsOpenChangePassword(false);
    setEmail(userEmail);
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    try {
      await recoveryPassword({ email: trimmedEmail });

      setSnackbarOpen(true, 'Письмо со ссылкой для смены пароля отправлено');
      setIsOpenChangePassword(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbarOpen(
          true,
          error.response?.data?.message ?? 'Не удалось отправить письмо'
        );
        return;
      }

      setSnackbarOpen(true, 'Не удалось отправить письмо');
    }
  };

  return (
    <Stack spacing={3}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Безопасность аккаунта
      </Typography>

      {!isOpenChangePassword && (
        <SettingsRow
          title="Сменить пароль"
          description="Сменить пароль для входа в систему"
          action={
            <Button
              color="primary"
              size="small"
              variant="outlined"
              onClick={handleOpenChangePassword}
              sx={{ px: 2 }}
            >
              Сменить пароль
            </Button>
          }
        />
      )}

      {isOpenChangePassword && (
        <Stack>
          <Typography
            color="info"
            sx={{ mb: 3 }}
          >
            Введите ваш email <br /> Мы отправим вам ссылку для смены пароля
          </Typography>

          <TextField
            type="email"
            sx={{ mb: 2, width: '60%' }}
            label="Почта"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />

          <Stack
            direction="row"
            spacing={2}
          >
            <Button
              size="small"
              variant="outlined"
              color="primary"
              disabled={isPending}
              onClick={handleBack}
            >
              Отменить
            </Button>

            <Button
              size="small"
              variant="contained"
              color="primary"
              loading={isPending}
              disabled={!email.trim() || isPending}
              onClick={handleSubmit}
            >
              Отправить
            </Button>
          </Stack>
        </Stack>
      )}

      <SettingsRow
        title="2-факторная аутентификация"
        description="Включите 2-факторную аутентификацию для повышения безопасности вашего аккаунта."
        action={
          <Switch
            disabled
            checked={is2FAEnabled}
            onChange={(_, checked) => setIs2FAEnabled(checked)}
          />
        }
      />
    </Stack>
  );
};
