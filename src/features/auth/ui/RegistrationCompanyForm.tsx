import { yupResolver } from '@hookform/resolvers/yup';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { RHFInput } from '@/shared/ui/rhf';

import {
  defaultRegistrationCompanyValues,
  registrationCompanySchema,
  type RegistrationCompanyRequest,
} from '../model';
import { useRegistrationCompanyMutation } from '../model/api/api';
import { useAuthStore } from '../model/store/store';

type RegistrationCompanyFormProps = {
  onSuccess?: () => void;
  onError?: (isOpen: boolean, message: string) => void;
};

const RegistrationCompanyForm = ({
  onSuccess,
  onError,
}: RegistrationCompanyFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: registrationCompany } = useRegistrationCompanyMutation();

  const navigate = useNavigate();

  const { setAuth } = useAuthStore();

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: defaultRegistrationCompanyValues,
    resolver: yupResolver(registrationCompanySchema),
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (formData: RegistrationCompanyRequest) => {
    try {
      const data = await registrationCompany(formData);

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
        onError?.(true, e.response?.data.message);
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
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
            props={{
              label: 'Пароль',
              type: showPassword ? 'text' : 'password',
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

export default RegistrationCompanyForm;
