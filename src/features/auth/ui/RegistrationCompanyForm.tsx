import { yupResolver } from '@hookform/resolvers/yup';
import {
  VisibilityOffOutlined,
  VisibilityOutlined,
  HelpOutlineOutlined,
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
  defaultRegistrationCompanyValues,
  mapAuthSessionUser,
  registrationCompanySchema,
  type RegistrationCompanyFormType,
  type RegistrationCompanyRequest,
} from '../model';
import { useRegistrationCompanyMutation } from '../model/api/api';
import { useAuthStore } from '../model/store/store';
import { PASSWORD_RULES_HINT } from '../model/utils/validation';

import { AuthLegalNotice } from './AuthLegalNotice';

type RegistrationCompanyFormProps = {
  onSuccess?: () => void;
  onError?: (isOpen: boolean, message: string) => void;
};

const RegistrationCompanyForm = ({
  onSuccess,
  onError,
}: RegistrationCompanyFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: registrationCompany } = useRegistrationCompanyMutation();

  const navigate = useNavigate();

  const { setAuth } = useAuthStore();

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultRegistrationCompanyValues,
    resolver: yupResolver(registrationCompanySchema),
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (formData: RegistrationCompanyFormType) => {
    const payload: RegistrationCompanyRequest = {
      companyName: formData.companyName,
      email: formData.email,
      password: formData.password,
    };

    try {
      const data = await registrationCompany(payload);

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
              name="companyName"
              control={control}
              props={{
                label: 'Название компании',
                sx: { flex: 1 },
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
          >
            Зарегистрироваться
          </Button>

          <AuthLegalNotice actionLabel="Зарегистрироваться" />
        </Box>
      </form>
    </FormProvider>
  );
};

export default RegistrationCompanyForm;
