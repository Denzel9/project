import { Avatar, Box, Button, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { FormBlock, FormBlockRowItem, RHFInput } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { ProfileMediaUploadButton } from './ProfileMediaUploadButton';

import type { ProfileMediaField } from '../../model/hooks/useProfileMediaUpload';
import type { User } from '@/entities';

type ManagerAccountSectionProps = {
  user?: User;
};

export const ManagerAccountSection = ({ user }: ManagerAccountSectionProps) => {
  const { setSnackbarOpen } = useSnackbarStore();
  const { control, setValue, watch } = useFormContext();

  const avatarUrl = watch('avatar') || user?.avatar || '';

  const handleMediaUploaded = (field: ProfileMediaField, url: string) => {
    setValue(field, url);
    setSnackbarOpen?.(true, 'Аватар обновлён');
  };

  return (
    <Box
      sx={{
        overflow: 'scroll',
        position: 'relative',
        scrollbarWidth: 'none',
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Личная информация
      </Typography>

      <Typography
        variant="body2"
        color="info"
        sx={{ mt: 1 }}
      >
        Имя и фамилия отображаются в комментариях, задачах и уведомлениях,
        когда вы действуете от имени компании.
      </Typography>

      <Box sx={{ position: 'relative', mt: 4, width: 'fit-content' }}>
        <Avatar
          src={avatarUrl}
          sx={{ width: 140, height: 140 }}
        />
        <Box sx={{ position: 'absolute', bottom: -5, right: -5 }}>
          <ProfileMediaUploadButton
            field="avatar"
            onUploaded={url => handleMediaUploaded('avatar', url)}
            onError={message => setSnackbarOpen?.(true, message)}
          />
        </Box>
      </Box>

      <FormBlock sx={{ my: 4, width: '50%' }}>
        <FormBlockRowItem>
          <RHFInput
            name="name"
            control={control}
            props={{
              fullWidth: true,
              label: 'Имя',
            }}
          />
        </FormBlockRowItem>
        <FormBlockRowItem>
          <RHFInput
            name="lastName"
            control={control}
            props={{
              fullWidth: true,
              label: 'Фамилия',
            }}
          />
        </FormBlockRowItem>
      </FormBlock>

      <Button
        type="submit"
        variant="contained"
      >
        Сохранить
      </Button>
    </Box>
  );
};
