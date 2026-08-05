import { yupResolver } from '@hookform/resolvers/yup';
import {
  HelpOutlineOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { prefetchUserConfig } from '@/entities/user-config';
import { queryClient } from '@/shared/api';
import { RHFInput } from '@/shared/ui/rhf';

import {
  defaultRegistrationManagerValues,
  mapAuthSessionUser,
  registrationManagerSchema,
  type RegistrationManagerFormType,
  type RegistrationManagerRequest,
} from '../model';
import { useRegistrationManagerMutation } from '../model/api/api';
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
                label: 'Имя',
              }}
            />
            <RHFInput
              name="lastName"
              control={control}
              props={{
                label: 'Фамилия',
              }}
            />
          </Box>

          <RHFInput
            name="email"
            control={control}
            props={{
              label: 'Почта',
              type: 'email',
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
                <Tooltip
                  title={PASSWORD_RULES_HINT}
                  slotProps={{
                    tooltip: {
                      sx: { whiteSpace: 'pre-line' },
                    },
                  }}
                >
                  <HelpOutlineOutlined
                    color="info"
                    sx={{ cursor: 'help' }}
                  />
                </Tooltip>
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <VisibilityOffOutlined />
                  ) : (
                    <VisibilityOutlined />
                  )}
                </IconButton>
              </Stack>
            }
            props={{
              label: 'Пароль',
              type: showPassword ? 'text' : 'password',
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
                  <VisibilityOffOutlined />
                ) : (
                  <VisibilityOutlined />
                )}
              </IconButton>
            }
            props={{
              label: 'Повторите пароль',
              type: showConfirmPassword ? 'text' : 'password',
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
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
