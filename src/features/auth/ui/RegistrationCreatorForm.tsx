import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button } from '@mui/material';
import axios from 'axios';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { RHFInput } from '@/shared/ui/rhf';

import {
  defaultRegistrationCreatorValues,
  registrationCreatorSchema,
  type RegistrationCreatorRequest,
} from '../model';
import { useRegistrationUserMutation } from '../model/api/api';
import { useAuthStore } from '../model/store/store';

type RegistrationCreatorFormProps = {
  onSuccess?: () => void;
  onError?: ({ message, isOpen }: { message: string; isOpen: boolean }) => void;
};

const RegistrationCreatorForm = ({
  onSuccess,
  onError,
}: RegistrationCreatorFormProps) => {
  const { mutateAsync: registrationCreator } = useRegistrationUserMutation();

  const navigate = useNavigate();

  const { setAuth } = useAuthStore();

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultRegistrationCreatorValues,
    resolver: yupResolver(registrationCreatorSchema),
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (formData: RegistrationCreatorRequest) => {
    try {
      const data = await registrationCreator(formData);

      if (data?.data?.user) {
        setAuth(
          data.data.user.id,
          data.data.user.role,
          data.data.user.membershipRole
        );
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
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <RHFInput
              name="name"
              control={control}
              props={{
                label: 'Имя',
                sx: { flex: 1 },
              }}
            />

            <RHFInput
              name="lastName"
              control={control}
              props={{
                label: 'Фамилия',
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
            props={{
              label: 'Пароль',
              type: 'password',
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 4 }}
          >
            Зарегистрироваться
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default RegistrationCreatorForm;
