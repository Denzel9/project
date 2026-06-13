import { Upload } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormBlock, FormBlockRowItem, PhoneInput } from '@/shared';
import { RHFInput } from '@/shared/ui/rhf';

import { ContactsSection } from './ContactsSection';
import { ParametersSection } from './ParametersSection';

import type { ProfileSectionProps } from '../../model/types';

export const ProfileSection = ({
  user,
  snackbar,
  setSnackbar,
}: ProfileSectionProps) => {
  const [isOpenAddContacts, setIsOpenAddContacts] = useState(false);

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '' });
  };

  const { control } = useFormContext();

  return (
    <Box
      sx={{
        overflow: 'scroll',
        position: 'relative',
        scrollbarWidth: 'none',
        height: 'calc(100vh - 200px)',
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
          src={user?.avatar}
          sx={{ width: 100, height: 100 }}
        />
        <Box sx={{ position: 'absolute', bottom: -5, right: -5 }}>
          <IconButton>
            <Upload />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 4,
          width: '100%',
          height: '250px',
          borderRadius: '32px',
          position: 'relative',
          backgroundSize: 'cover',
          backgroundPosition: 'center ',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url(/cosmetic.jpg)',
        }}
      >
        <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
          <IconButton>
            <Upload />
          </IconButton>
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
        setSnackbar={setSnackbar}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};
