import { yupResolver } from '@hookform/resolvers/yup';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { prefetchUserConfig } from '@/entities/user-config';
import { queryClient } from '@/shared/api';
import { RHFCheckbox, RHFInput } from '@/shared/ui/rhf';

import {
  defaultLoginValues,
  loginSchema,
  mapAuthSessionUser,
  useAuthStore,
  type LoginFormType,
} from '../model';
import { useLoginMutation } from '../model/api/api';

import { AuthLegalNotice } from './AuthLegalNotice';

type LoginFormProps = {
  onSuccess?: () => void;
  onRecoveryPassword?: () => void;
  onError?: (isOpen: boolean, message: string) => void;
};

const LoginForm = ({
  onSuccess,
  onError,
  onRecoveryPassword,
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: login } = useLoginMutation();

  const { setAuth } = useAuthStore();

  const navigate = useNavigate();

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultLoginValues,
    resolver: yupResolver(loginSchema),
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (formData: LoginFormType) => {
    try {
      const data = await login(formData);

      if (data.data.user) {
        setAuth(mapAuthSessionUser(data.data.user));

        try {
          await prefetchUserConfig(queryClient);
        } catch {
          // конфиг не критичен для входа
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
        <Box
          sx={{
            mt: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <RHFInput
            name="email"
            control={control}
            autoCapitalize="off"
            props={{
              label: 'Почта',
            }}
          />
          <RHFInput
            name="password"
            control={control}
            autoCapitalize="off"
            endAdornment={
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
            props={{
              sx: { mt: 2 },
              label: 'Пароль',
              type: showPassword ? 'text' : 'password',
            }}
          />
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <RHFCheckbox
              name="rememberMe"
              control={control}
              labelColor="info"
              labelFontSize="13px"
              label="Запомнить меня"
              props={{
                sx: { mt: 2 },
              }}
            />

            <Button
              size="small"
              variant="text"
              color="info"
              onClick={onRecoveryPassword}
              sx={{ px: 2, textTransform: 'none' }}
            >
              Забыли пароль?
            </Button>
          </Box>

          <Button
            size="large"
            type="submit"
            sx={{ mt: 2 }}
            variant="contained"
          >
            Войти
          </Button>

          <AuthLegalNotice actionLabel="Войти" />
        </Box>
      </form>
    </FormProvider>
  );
};

export default LoginForm;
