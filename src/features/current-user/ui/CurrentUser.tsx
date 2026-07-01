import { Add, ManageAccounts } from '@mui/icons-material';
import { TextField, MenuItem, Skeleton, Menu, IconButton } from '@mui/material';
import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { useGetProfilesQuery, useSwitchProfileMutation } from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { useCurrentUserStore } from '../model/store';

export const CurrentUser = ({ isButton = false }: { isButton?: boolean }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { setSnackbarOpen } = useSnackbarStore();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const { data, isLoading } = useGetProfilesQuery();

  const { mutateAsync: switchProfile, isPending } = useSwitchProfileMutation();

  const { id, setAuth } = useAuthStore();

  const { currentUser, setCurrentUser } = useCurrentUserStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (data?.data) {
      const tryCurrentUser = data.data.find(item => item.userId === id);
      setCurrentUser(tryCurrentUser?.userId || '');
    }
  }, [data, id, setCurrentUser]);

  const handleSwitchProfile = async (id: string) => {
    const res = await switchProfile(id);
    setAuth(
      res.data.user?.id,
      res.data.user?.role as string,
      res.data.user?.membershipRole as string
    );
  };

  const handleChangeUser = async (value: string) => {
    if (value === 'newUser') {
      navigate(ROUTES.SETTINGS_MEMBERS);
      return;
    }

    await handleSwitchProfile(value);
    // TODO: Обязательно разкомментировать
    navigate(ROUTES.INDEX);
    setCurrentUser(value);
    setAnchorEl(null);
    setSnackbarOpen?.(true, 'Профиль успешно переключен');
  };

  if (isLoading || isPending) {
    return (
      <Skeleton
        height={56}
        variant="rounded"
        sx={{ width: '30%' }}
      />
    );
  }

  if (isButton) {
    return (
      <>
        <IconButton
          color="primary"
          onClick={handleClick}
        >
          <ManageAccounts />
        </IconButton>

        <Menu
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
        >
          {data?.data?.map(item => (
            <MenuItem
              key={item.id}
              disabled={item.userId === id}
              onClick={() => handleChangeUser(item.userId || '')}
            >
              {item.displayName}
            </MenuItem>
          ))}

          <MenuItem
            value="newUser"
            sx={{ color: 'primary.main' }}
          >
            <Add
              sx={{ mr: 1 }}
              color="primary"
            />{' '}
            Добавить пользователя
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <TextField
      select
      size="small"
      value={currentUser}
      onChange={e => handleChangeUser(e.target.value)}
      sx={{
        borderRadius: '16px',
        backgroundColor: 'white',
      }}
    >
      {data?.data?.map(item => (
        <MenuItem
          key={item.id}
          disabled={item.userId === id}
          value={item.userId}
        >
          {item.displayName}
        </MenuItem>
      ))}
      <MenuItem
        value="newUser"
        sx={{ color: 'primary.main' }}
      >
        <Add
          sx={{ mr: 1 }}
          color="primary"
        />{' '}
        Добавить пользователя
      </MenuItem>
    </TextField>
  );
};
