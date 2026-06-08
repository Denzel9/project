import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button } from '@mui/material';
import axios from 'axios';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { RHFCheckbox, RHFInput } from '@/shared/ui/rhf';

import { defaultLoginValues, loginSchema, useAuthStore } from '../model';
import { useLoginMutation } from '../model/api/api';

type LoginFormProps = {
  onSuccess?: () => void;
  onRecoveryPassword?: () => void;
  onError?: ({ message, isOpen }: { message: string; isOpen: boolean }) => void;
};

const LoginForm = ({
  onSuccess,
  onError,
  onRecoveryPassword,
}: LoginFormProps) => {
  const { mutateAsync: login } = useLoginMutation();

  const { setAuth } = useAuthStore();

  const navigate = useNavigate();

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultLoginValues,
    resolver: yupResolver(loginSchema),
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (formData: typeof defaultLoginValues) => {
    try {
      const data = await login(formData);

      if (data.data.user) {
        setAuth(data.data.user.id);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/');
        }
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        onError?.({ message: e.response?.data.message, isOpen: true });
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4 }}>
          <RHFInput
            name="email"
            control={control}
            props={{
              label: 'Почта',
            }}
          />

          <RHFInput
            name="password"
            control={control}
            props={{
              type: 'password',
              sx: { mt: 2 },
              label: 'Пароль',
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
              label="Запомнить меня"
              labelColor="info"
              props={{
                sx: { mt: 2 },
              }}
            />

            <Button
              variant="text"
              color="primary"
              size="small"
              sx={{ px: 2 }}
              onClick={onRecoveryPassword}
            >
              Забыли пароль?
            </Button>
          </Box>

          <Button
            size="large"
            type="submit"
            variant="contained"
            sx={{ mt: 4 }}
          >
            Войти
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default LoginForm;
