import { Avatar, Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormBlock, FormBlockRowItem, PhoneInput, RHFInput } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { ContactsSection } from './ContactsSection';
import { ParametersSection } from './ParametersSection';
import { ProfileMediaUploadButton } from './ProfileMediaUploadButton';

import type { ProfileMediaField } from '../../model/hooks/useProfileMediaUpload';
import type { ProfileSectionProps } from '../../model/types';

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const [isOpenAddContacts, setIsOpenAddContacts] = useState(false);

  const { setSnackbarOpen } = useSnackbarStore();

  const { control, setValue, watch } = useFormContext();

  const avatarUrl = watch('avatar') || user?.avatar || '';
  const bannerUrl = watch('banner') || user?.banner || '';

  const handleMediaUploaded = (field: ProfileMediaField, url: string) => {
    setValue(field, url);
    setSnackbarOpen?.(
      true,
      field === 'avatar' ? 'Аватар обновлён' : 'Баннер обновлён'
    );
  };

  const handleMediaError = (message: string) => {
    setSnackbarOpen?.(true, message);
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

      {/* Аватар */}
      <Box sx={{ position: 'relative', mt: 4, width: 'fit-content' }}>
        <Avatar
          src={avatarUrl}
          sx={{ width: 140, height: 140 }}
        />
        <Box sx={{ position: 'absolute', bottom: -5, right: -5 }}>
          <ProfileMediaUploadButton
            field="avatar"
            onUploaded={url => handleMediaUploaded('avatar', url)}
            onError={handleMediaError}
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: 4,
          width: '100%',
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '32px',
          position: 'relative',
          bgcolor: 'secondary.light',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...(bannerUrl && {
            backgroundImage: `url(${bannerUrl})`,
          }),
        }}
      >
        {!bannerUrl && (
          <Typography
            variant="h6"
            sx={{ opacity: 0.5 }}
          >
            Тут будет баннер
          </Typography>
        )}
        <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
          <ProfileMediaUploadButton
            field="banner"
            onUploaded={url => handleMediaUploaded('banner', url)}
            onError={handleMediaError}
          />
        </Box>
      </Box>

      {/* Название компании */}
      {user?.companyProfile && (
        <RHFInput
          name="companyName"
          control={control}
          props={{
            fullWidth: true,
            label: 'Название компании',
          }}
        />
      )}

      {/* Имя и фамилия */}
      {!user?.companyProfile && (
        <FormBlock>
          <RHFInput
            name="name"
            control={control}
            props={{
              fullWidth: true,
              label: 'Имя',
            }}
          />

          <RHFInput
            name="lastName"
            control={control}
            props={{
              fullWidth: true,
              label: 'Фамилия',
            }}
          />

          <FormBlockRowItem>
            <RHFInput
              name="bio"
              control={control}
              maxLength={300}
              props={{
                rows: 4,
                multiline: true,
                fullWidth: true,
                label: 'О себе',
              }}
            />
          </FormBlockRowItem>

          <FormBlockRowItem>
            <RHFInput
              name="location"
              control={control}
              props={{
                fullWidth: true,
                label: 'Местоположение',
              }}
            />
          </FormBlockRowItem>
        </FormBlock>
      )}

      {/* Контактная информация */}
      <FormBlock title="Контактная информация">
        <RHFInput
          name="email"
          control={control}
          props={{
            fullWidth: true,
            label: 'Основной email',
          }}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <PhoneInput
              {...field}
              label="Основной номер телефона"
              onChange={field.onChange}
              value={field.value}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </FormBlock>

      {/* Дополнительные контакты */}
      <ContactsSection
        isOpenAddContacts={isOpenAddContacts}
        setIsOpenAddContacts={setIsOpenAddContacts}
      />

      <FormBlock title="Основные данные">
        <FormBlockRowItem>
          <RHFInput
            name="aboutMe"
            control={control}
            maxLength={2000}
            props={{
              rows: 4,
              multiline: true,
              fullWidth: true,
              label: 'Обо мне',
            }}
          />
        </FormBlockRowItem>

        <ParametersSection />
      </FormBlock>

      {/* Кнопка сохранения */}
      <FormBlock>
        <Button
          size="small"
          type="submit"
          variant="outlined"
          sx={{ maxWidth: '140px', flexShrink: 0 }}
        >
          Сохранить
        </Button>
      </FormBlock>
    </Box>
  );
};
