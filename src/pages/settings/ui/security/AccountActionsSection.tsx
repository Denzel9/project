import { Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router';

import { useLogoutMutation } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

import { SettingsRow } from '../SettingsRow';

export const AccountActionsSection = () => {
  const { mutateAsync: logout } = useLogoutMutation();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.AUTH);
  };

  return (
    <Stack spacing={3}>
      <SettingsRow
        title="Выйти"
        description="Выйти из текущего аккаунта"
        action={
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={handleLogout}
            sx={{ minWidth: 100, flexShrink: 0 }}
          >
            Выйти
          </Button>
        }
      />
    </Stack>
  );
};
