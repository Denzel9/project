import { Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import axios from 'axios';

import { useAuthStore, useSendConfirmEmailMutation } from '@/features/auth';
import { useSnackbarStore } from '@/widgets';

import { SettingsRow } from '../SettingsRow';

export const SettingsGeneralPage = () => {
  const { isEmailConfirmed } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();
  const { mutateAsync: sendConfirmEmail, isPending } =
    useSendConfirmEmailMutation();

  const handleConfirm = async () => {
    try {
      const { data } = await sendConfirmEmail();
      setSnackbarOpen?.(
        true,
        data.message || 'Письмо для подтверждения почты отправлено'
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;
      setSnackbarOpen?.(
        true,
        typeof message === 'string' ? message : 'Не удалось отправить письмо'
      );
    }
  };

  return (
    <Stack spacing={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Общие
      </Typography>

      <SettingsRow
        title="Почта"
        description={
          isEmailConfirmed
            ? undefined
            : 'Подтвердить почту, чтобы получить полный доступ к сервису'
        }
        action={
          isEmailConfirmed ? <Chip color="success" label="Почта подтверждена" /> : (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ px: 2 }}
              disabled={isPending}
              onClick={() => void handleConfirm()}
              startIcon={
                isPending ? (
                  <CircularProgress
                    size={14}
                    color="inherit"
                  />
                ) : undefined
              }
            >
              {isPending ? 'Отправка…' : 'Подтвердить'}
            </Button>
          )
        }
      />

      <SettingsRow
        title="Верификация"
        description="Верифицировать аккаунт"
        action={
          <Button
            size="small"
            variant="outlined"
            color="primary"
            sx={{ px: 2 }}
          >
            Верифицировать
          </Button>
        }
      />
    </Stack>
  );
};

export default SettingsGeneralPage;
