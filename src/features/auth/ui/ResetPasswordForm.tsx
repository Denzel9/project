import { yupResolver } from '@hookform/resolvers/yup';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';

import { ROUTES, RHFInput } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import {
  defaultResetPasswordValues,
  resetPasswordSchema,
  useAuthStore,
  type ResetPasswordFormType,
} from '../model';
import {
  useLogoutMutation,
  useResetPasswordMutation,
  useVerifyPasswordMutation,
} from '../model/api/api';
import { validationEqualPassword } from '../model/utils/validation';

const ResetPasswordForm = () => {
  const { setSnackbarOpen } = useSnackbarStore();
  const { removeAuth } = useAuthStore();

  const { mutateAsync: resetPassword } = useResetPasswordMutation();
  const { mutateAsync: verifyPassword } = useVerifyPasswordMutation();
  const { mutateAsync: logoutMutation } = useLogoutMutation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [showRepeatNewPassword, setShowRepeatNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultResetPasswordValues,
    resolver: yupResolver(resetPasswordSchema) as Resolver<
      typeof defaultResetPasswordValues
    >,
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (formData: ResetPasswordFormType) => {
    await verifyPassword({
      password: formData.oldPassword,
    }).catch(e => {
      if (axios.isAxiosError(e)) {
        setSnackbarOpen?.(true, e.response?.data.message);
        return false;
      }

      return false;
    });

    if (
      validationEqualPassword(formData.repeatNewPassword, formData.newPassword)
    ) {
      setSnackbarOpen?.(true, 'Пароли не совпадают');
      return;
    }

    try {
      if (token) {
        await resetPassword({
          newPassword: formData.newPassword,
          token,
        });

        await logoutMutation();
        removeAuth();

        navigate({ pathname: ROUTES.AUTH, search: `?isResetPassword=true` });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <RHFInput
            name="oldPassword"
            control={control}
            endAdornment={
              <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                {showOldPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
            props={{
              label: 'Старый пароль',
              sx: { width: '500px' },
              type: showOldPassword ? 'text' : 'password',
            }}
          />

          <RHFInput
            name="newPassword"
            control={control}
            endAdornment={
              <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
            props={{
              label: 'Новый пароль',
              sx: { mt: 2, width: '500px' },
              type: showNewPassword ? 'text' : 'password',
            }}
          />

          <RHFInput
            name="repeatNewPassword"
            control={control}
            endAdornment={
              <IconButton
                onClick={() => setShowRepeatNewPassword(!showRepeatNewPassword)}
              >
                {showRepeatNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
            props={{
              sx: { mt: 2, width: '500px' },
              label: 'Повторите новый пароль',
              type: showRepeatNewPassword ? 'text' : 'password',
            }}
          />

          <Button
            size="large"
            type="submit"
            variant="contained"
            sx={{ mt: 4 }}
          >
            Сохранить
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default ResetPasswordForm;
