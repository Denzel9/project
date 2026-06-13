import { Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router';

import { useLogoutMutation } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

import { SettingsRow } from './SettingsRow';

export const AccountActionsSection = () => {
  const { mutateAsync: logout } = useLogoutMutation();

  // const { mutateAsync: deleteAccount } = useDeleteAccountMutation();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.AUTH);
  };

  return (
    <Stack spacing={3}>
      <SettingsRow
        title="Выйти из всех устройств"
        description="Выйти из всех других активных сессий на других устройствах."
        action={
          <Button
            variant="outlined"
            size="small"
            sx={{ minWidth: 100, flexShrink: 0 }}
            onClick={handleLogout}
          >
            Выйти
          </Button>
        }
      />

      <SettingsRow
        title="Удалить аккаунт"
        titleColor="error.main"
        description="Удалить этот аккаунт и удалить доступ из всех рабочих пространств."
        action={
          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{ minWidth: 140, flexShrink: 0 }}
          >
            Удалить аккаунт
          </Button>
        }
      />
    </Stack>
  );
};
