import { yupResolver } from '@hookform/resolvers/yup';
import { Divider, Stack } from '@mui/material';
import axios from 'axios';
import { useEffect } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';

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
import { scrollSettingsToTop } from '@/shared';
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

  const onInvalid = (errors: FieldErrors<AccountSchemaFormType>) => {
    const firstError = Object.values(errors)[0];
    const message =
      typeof firstError?.message === 'string'
        ? firstError.message
        : 'Проверьте правильность заполнения полей';

    setSnackbarOpen?.(true, message, 'error');
    scrollSettingsToTop('smooth');
  };

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
        setSnackbarOpen?.(true, 'Данные успешно обновлены', 'success');
        scrollSettingsToTop('smooth');
        return;
      }

      await updateUser(parseRequestCreatorData(data, user?.data as User));
      setSnackbarOpen?.(true, 'Данные успешно обновлены', 'success');
      scrollSettingsToTop('smooth');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;

      setSnackbarOpen?.(
        true,
        typeof message === 'string'
          ? message
          : 'Не удалось сохранить изменения',
        'error'
      );
      console.error(error);
    }
  };

  return (
    <Stack
      spacing={4}
      divider={<Divider />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
