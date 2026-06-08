import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Snackbar } from '@mui/material';
import { useState } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';

import { ROUTES } from '@/shared/config/routes';
import { RHFInput } from '@/shared/ui/rhf';

import {
  defaultResetPasswordValues,
  resetPasswordSchema,
  type ResetPasswordFormType,
} from '../model';
import { useResetPasswordMutation } from '../model/api/api';
import {
  validatePassword,
  validationEqualPassword,
} from '../model/utils/validation';

const ResetPasswordForm = () => {
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
  });

  const { mutateAsync: resetPassword } = useResetPasswordMutation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultResetPasswordValues,
    resolver: yupResolver(resetPasswordSchema) as Resolver<
      typeof defaultResetPasswordValues
    >,
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (formData: ResetPasswordFormType) => {
    if (validationEqualPassword(formData.password, formData.newPassword)) {
      setSnackbar({
        isOpen: true,
        message: 'Пароли не совпадают',
      });
      return;
    }

    if (validatePassword(formData.password)) {
      setSnackbar({
        isOpen: true,
        message: 'Пароль должен быть не менее 8 символов',
      });
      return;
    }

    try {
      if (token) {
        await resetPassword({
          newPassword: formData.newPassword,
          token,
        });

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
            mt: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <RHFInput
            name="password"
            control={control}
            props={{
              label: 'Пароль',
            }}
          />

          <RHFInput
            name="newPassword"
            control={control}
            props={{
              sx: { mt: 2 },
              label: 'Новый пароль',
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

      <Snackbar
        open={snackbar.isOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ isOpen: false, message: '' })}
        message={snackbar.message}
      />
    </FormProvider>
  );
};

export default ResetPasswordForm;
