import { yupResolver } from '@hookform/resolvers/yup';
import { Divider, Stack } from '@mui/material';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  USER_ROLE,
  type CompanyProfile,
  type CreatorProfile,
  type Person,
  type User,
} from '@/entities';
import { useAuthStore } from '@/features';
import { queryClient } from '@/shared/api';
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

import { ManagerAccountSection } from './ManagerAccountSection';
import { ProfileSection } from './ProfileSection';

export const SettingsAccountPage = () => {
  const { setSnackbarOpen } = useSnackbarStore();
  const { id, role } = useAuthStore();
  const { mutateAsync: updateUser } = useUpdateUserMutation();
  const { data: user } = useGetUserByIdQuery(id);
  const isManager = role === USER_ROLE.MANAGER;

  const methods = useForm<AccountSchemaFormType>({
    mode: 'onBlur',
    resolver: yupResolver(accountSchema),
    defaultValues: defaultAccountSchemaValues,
  });

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    if (!user) return;

    if (isManager) {
      setValue('name', user.data?.person?.name ?? '');
      setValue('lastName', user.data?.person?.lastName ?? '');
      setValue('avatar', user.data?.avatar ?? '');
      return;
    }

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
          (user.data.person[key as keyof Person] ??
            null) as AccountSchemaFormType[keyof AccountSchemaFormType]
        );
      } else {
        setValue(
          key as keyof AccountSchemaFormType,
          (user.data?.[key as keyof User] ??
            null) as AccountSchemaFormType[keyof AccountSchemaFormType]
        );
      }
    });
  }, [setValue, user, isManager]);

  const onSubmit = async (data: AccountSchemaFormType) => {
    try {
      if (isManager) {
        await updateUser({
          avatar: data.avatar || null,
          person: {
            name: data.name?.trim() || null,
            lastName: data.lastName?.trim() || null,
          } as never,
        });
        await queryClient.invalidateQueries({ queryKey: ['profiles'] });
        setSnackbarOpen?.(true, 'Данные успешно обновлены');
        return;
      }

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
          {isManager ? (
            <ManagerAccountSection user={user?.data} />
          ) : (
            <ProfileSection user={user?.data} />
          )}
        </form>
      </FormProvider>
    </Stack>
  );
};

export default SettingsAccountPage;
