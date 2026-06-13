import { yupResolver } from '@hookform/resolvers/yup';
import { Divider, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useGetUserByIdQuery, useUpdateUserMutation } from '@/entities/user';
import { useAuthStore } from '@/features/auth';

import {
  COMPANY_PROFILE_KEYS,
  MY_PARAMETERS_KEYS,
  CREATOR_PROFILE_KEYS,
} from '../../model/constants';
import {
  accountSchema,
  defaultAccountSchemaValues,
  type AccountSchemaFormType,
} from '../../model/schema/accountSchema';
import { parseRequestCreatorData } from '../../model/utils';

import { ProfileSection } from './ProfileSection';

export const SettingsAccountPage = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
  });

  const { mutateAsync: updateUser } = useUpdateUserMutation();

  const { id } = useAuthStore();

  const { data: user } = useGetUserByIdQuery(id);

  const methods = useForm<AccountSchemaFormType>({
    mode: 'onBlur',
    resolver: yupResolver(accountSchema),
    defaultValues: defaultAccountSchemaValues,
  });

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    if (user) {
      Object.keys(defaultAccountSchemaValues).forEach(
        (key: keyof AccountSchemaFormType) => {
          if (
            CREATOR_PROFILE_KEYS.includes(key) &&
            user?.data?.creatorProfile
          ) {
            setValue(key, user?.data?.creatorProfile?.[key]);
          } else if (
            COMPANY_PROFILE_KEYS.includes(key) &&
            user.data?.companyProfile
          ) {
            setValue(key, user.data?.companyProfile?.[key]);
          } else if (MY_PARAMETERS_KEYS.includes(key) && user.data?.person) {
            setValue(key, user.data?.person?.[key]);
          } else {
            setValue(key, user.data?.[key]);
          }
        }
      );
    }
  }, [setValue, user]);

  const onSubmit = async (data: AccountSchemaFormType) => {
    try {
      if (user?.data?.companyProfile) {
        const res = await updateUser(parseRequestCreatorData(data, user?.data));
        if (res.data) {
          setSnackbar({ open: true, message: 'Данные успешно обновлены' });
        }
      } else {
        const res = await updateUser(parseRequestCreatorData(data, user?.data));
        if (res.data) {
          setSnackbar({ open: true, message: 'Данные успешно обновлены' });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Stack
      spacing={4}
      divider={<Divider />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ProfileSection
            user={user?.data}
            snackbar={snackbar}
            setSnackbar={setSnackbar}
          />
        </form>
      </FormProvider>
    </Stack>
  );
};

export default SettingsAccountPage;
