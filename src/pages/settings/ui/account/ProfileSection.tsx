import { Add } from '@mui/icons-material';
import { Avatar, Button, Snackbar, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import { useUpdateUserMutation, type User } from '@/entities/user';

export const ProfileSection = ({ user }: { user: User }) => {
  const { mutateAsync: updateUser } = useUpdateUserMutation();

  const [isOpenSnackbar, setIsOpenSnackbar] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setFirstName(user?.creatorProfile?.name || '');
        setLastName(user?.creatorProfile?.lastName || '');
        setCompanyName(user?.companyProfile?.companyName || '');
      }, 0);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (user?.companyProfile) {
        const res = await updateUser({
          companyProfile: {
            ...user?.companyProfile,
            companyName: companyName,
          },
        });
        if (res.data) {
          setIsOpenSnackbar(true);
          setCompanyName(res.data?.companyProfile?.companyName || '');
        }
      } else {
        const res = await updateUser({
          creatorProfile: {
            ...user?.creatorProfile,
            name: firstName,
            lastName: lastName,
          },
        });
        if (res.data) {
          setIsOpenSnackbar(true);
          setFirstName(res.data?.creatorProfile?.name || '');
          setLastName(res.data?.creatorProfile?.lastName || '');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isSaveDisabled =
    (user?.creatorProfile?.name === firstName &&
      user?.creatorProfile?.lastName === lastName) ||
    user?.companyProfile?.companyName === companyName;

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={3}
        sx={{ alignItems: 'end', mb: '16px !important' }}
      >
        <Avatar
          src={user?.avatar}
          sx={{ width: 80, height: 80 }}
        />

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            sx={{ px: 2 }}
          >
            Изменить изображение
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            sx={{ px: 2 }}
          >
            Удалить изображение
          </Button>
        </Stack>
      </Stack>

      {user?.companyProfile && (
        <Stack
          direction="row"
          spacing={2}
        >
          <TextField
            fullWidth
            label="Название компании"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
        </Stack>
      )}

      {!user?.companyProfile && (
        <Stack
          direction="row"
          spacing={2}
        >
          <TextField
            fullWidth
            label="Имя"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />

          <TextField
            fullWidth
            label="Фамилия"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </Stack>
      )}

      <Button
        variant="outlined"
        size="small"
        sx={{ maxWidth: '140px', flexShrink: 0 }}
        onClick={handleSave}
        disabled={isSaveDisabled}
      >
        Сохранить
      </Button>

      <Snackbar
        open={isOpenSnackbar}
        onClose={() => setIsOpenSnackbar(false)}
        message="Изменения сохранены"
        autoHideDuration={3000}
      />
    </Stack>
  );
};
