import { Add } from '@mui/icons-material';
import { TextField, MenuItem, Skeleton } from '@mui/material';
import { useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';

import {
  useGetProfilesQuery,
  useSwitchProfileMutation,
} from '@/entities/workspace-member';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared';

import { useCurrentUserStore } from '../model/store';

export const CurrentUser = () => {
  const { data, isLoading } = useGetProfilesQuery();
  const { mutateAsync: switchProfile, isPending } = useSwitchProfileMutation();

  const { id, setAuth } = useAuthStore();

  const { currentUser, setCurrentUser } = useCurrentUserStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (data?.data) {
      const tryCurrentUser = data.data.find(item => item.userId === id);
      setCurrentUser(tryCurrentUser?.userId);
    }
  }, [data, id, setCurrentUser]);

  const handleSwitchProfile = async (id: string) => {
    const res = await switchProfile(id);
    setAuth(res.data.user?.id);
  };

  const handleChangeUser = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '4') {
      navigate(ROUTES.SETTINGS_MEMBERS);
      return;
    }

    await handleSwitchProfile(event.target.value);
    setCurrentUser(event.target.value);
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

  return (
    <TextField
      select
      value={currentUser}
      onChange={handleChangeUser}
      sx={{
        width: '30%',
        backgroundColor: 'white',
        borderRadius: '16px',
      }}
    >
      {data?.data?.map(item => (
        <MenuItem
          key={item.id}
          value={item.userId}
        >
          {item.displayName}
        </MenuItem>
      ))}
      <MenuItem
        value="4"
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
