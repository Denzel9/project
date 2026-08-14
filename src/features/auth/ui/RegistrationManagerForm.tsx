import { yupResolver } from '@hookform/resolvers/yup';
import {
  HelpOutlineOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Box, Button, IconButton, Stack, } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { prefetchUserConfig } from '@/entities/user-config';
import { queryClient, RHFInput, NSTooltip } from '@/shared';
import {} from '@/shared';

import {
  defaultRegistrationManagerValues,
  mapAuthSessionUser,
  registrationManagerSchema,
  type RegistrationManagerFormType,
  type RegistrationManagerRequest,
} from '../model';
import { useRegistrationManagerMutation } from '../model/api/api';
import { WHITE_COLOR, WHITE_INPUT_VARIANT } from '../model/constants';
import { useAuthStore } from '../model/store/store';
import { PASSWORD_RULES_HINT } from '../model/utils/validation';

import { AuthLegalNotice } from './AuthLegalNotice';

type RegistrationManagerFormProps = {
  onSuccess?: () => void;
  onError?: (isOpen: boolean, message: string) => void;
};

const RegistrationManagerForm = ({
  onSuccess,
  onError,
}: RegistrationManagerFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: registrationManager } = useRegistrationManagerMutation();

  const navigate = useNavigate();

  const { setAuth } = useAuthStore();

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultRegistrationManagerValues,
    resolver: yupResolver(registrationManagerSchema),
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (formData: RegistrationManagerFormType) => {
    const payload: RegistrationManagerRequest = {
      name: formData.name,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    try {
      const data = await registrationManager(payload);

      if (data?.data?.user) {
        setAuth(mapAuthSessionUser(data.data.user));

        try {
          await prefetchUserConfig(queryClient);
        } catch {
          // конфиг не критичен для регистрации
        }

        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/');
        }
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        onError?.(true, e.response?.data.message || 'Произошла ошибка');
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <RHFInput
              name="name"
              control={control}
              props={{
                fullWidth: true,
                label: 'Имя',
                sx: { ...WHITE_INPUT_VARIANT },
              }}
            />
            <RHFInput
              name="lastName"
              control={control}

              props={{
                fullWidth: true,
                label: 'Фамилия',
                sx: { ...WHITE_INPUT_VARIANT },
              }}
            />
          </Box>

          <RHFInput
            name="email"
            control={control}
            props={{
              label: 'Почта',
              type: 'email',
              sx: { ...WHITE_INPUT_VARIANT },
            }}
          />

          <RHFInput
            name="password"
            control={control}
            endAdornment={
              <Stack
                spacing={1}
                direction="row"
                sx={{ alignItems: 'center' }}
              >
                <NSTooltip
                  title={PASSWORD_RULES_HINT}
                >
                  <HelpOutlineOutlined
                    sx={{ color: WHITE_COLOR, cursor: 'pointer' }}
                  />
                </NSTooltip>
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <VisibilityOffOutlined sx={{ color: WHITE_COLOR }} />
                  ) : (
                    <VisibilityOutlined sx={{ color: WHITE_COLOR }} />
                  )}
                </IconButton>
              </Stack>
            }
            props={{
              label: 'Пароль',
              type: showPassword ? 'text' : 'password',
              sx: { ...WHITE_INPUT_VARIANT },
            }}
          />

          <RHFInput
            name="confirmPassword"
            control={control}
            endAdornment={
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <VisibilityOffOutlined sx={{ color: WHITE_COLOR }} />
                ) : (
                  <VisibilityOutlined sx={{ color: WHITE_COLOR }} />
                )}
              </IconButton>
            }
            props={{
              label: 'Повторите пароль',
              type: showConfirmPassword ? 'text' : 'password',
              sx: { ...WHITE_INPUT_VARIANT },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
          >
            Зарегистрироваться
          </Button>

          <AuthLegalNotice actionLabel={'Зарегистрироваться'} />
        </Box>
      </form>
    </FormProvider>
  );
};

export default RegistrationManagerForm;
