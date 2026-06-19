import { yupResolver } from '@hookform/resolvers/yup';
import { Divider, Stack } from '@mui/material';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  type CompanyProfile,
  type CreatorProfile,
  type Person,
  type User,
} from '@/entities';
import { useAuthStore } from '@/features';
import { useSnackbarStore } from '@/widgets';

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
  const { setSnackbarOpen } = useSnackbarStore();

  const { mutateAsync: updateUser } = useUpdateUserMutation();

  const { id } = useAuthStore();

  const { data: user } = useGetUserByIdQuery(id);

  const methods = useForm<AccountSchemaFormType>({
    mode: 'onBlur',
    resolver: yupResolver(accountSchema),
    defaultValues: defaultAccountSchemaValues,
  });

  const { handleSubmit, setValue } = methods;

  // TODO: need to refactor this
  useEffect(() => {
    if (user) {
      Object.keys(defaultAccountSchemaValues).forEach(key => {
        if (CREATOR_PROFILE_KEYS.includes(key) && user?.data?.creatorProfile) {
          setValue(
            key as keyof AccountSchemaFormType,
            user?.data?.creatorProfile?.[key as keyof CreatorProfile]
          );
        } else if (
          COMPANY_PROFILE_KEYS.includes(key) &&
          user.data?.companyProfile
        ) {
          setValue(
            key as keyof AccountSchemaFormType,
            user.data?.companyProfile?.[key as keyof CompanyProfile]
          );
        } else if (MY_PARAMETERS_KEYS.includes(key) && user.data?.person) {
          setValue(
            key as keyof AccountSchemaFormType,
            user.data?.person?.[key as keyof Person]
          );
        } else {
          setValue(
            key as keyof AccountSchemaFormType,
            user.data?.[key as keyof User & keyof AccountSchemaFormType]
          );
        }
      });
    }
  }, [setValue, user]);

  const onSubmit = async (data: AccountSchemaFormType) => {
    try {
      if (user?.data?.companyProfile) {
        const res = await updateUser(parseRequestCreatorData(data, user?.data));
        if (res.data) {
          setSnackbarOpen?.(true, 'Данные успешно обновлены');
        }
      } else {
        const res = await updateUser(
          parseRequestCreatorData(data, user?.data as User)
        );
        if (res.data) {
          setSnackbarOpen?.(true, 'Данные успешно обновлены');
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
          <ProfileSection user={user?.data} />
        </form>
      </FormProvider>
    </Stack>
  );
};

export default SettingsAccountPage;
