import { yupResolver } from '@hookform/resolvers/yup';
import { Upload } from '@mui/icons-material';
import {
  Backdrop,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { useState, type SyntheticEvent, type MouseEvent } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { useGetUserByIdQuery, useUpdateUserMutation } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { CurrentUser } from '@/features/current-user';
import { SideBarButton } from '@/widgets/side-bar/ui/SideBarButton';

import { useSetValue } from '../model/hooks/useSetValue';
import {
  defaultValues,
  profileSchema,
  type ProfileSchemaType,
} from '../model/schema/schema';
import { useProfileStore } from '../model/store';
import { parseRequestData } from '../model/utils/helpers';

import { ActionButton } from './ActionButton';
import { Content } from './Content';
import { UserCard } from './UserCard';

export const ProfilePage = () => {
  const methods = useForm<ProfileSchemaType>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(profileSchema),
  });

  const { setValue, handleSubmit, formState } = methods;

  console.log(formState);

  const { isEdit, setIsEdit } = useProfileStore();

  const { mutateAsync: updateUser } = useUpdateUserMutation();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('userId');

  const { id: userId } = useAuthStore();

  const { data: user, isLoading } = useGetUserByIdQuery(id || userId);

  const [tabValue, setTabValue] = useState(0);

  const { resetForm } = useSetValue({ user: user?.data, id, setValue });

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setIsEdit(true);
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    resetForm();
  };

  const handleSaveChanges = (data: ProfileSchemaType) => {
    if (isEdit) {
      const isChanged = Object.keys(data).some(
        key => data[key] !== user?.data?.[key]
      );

      try {
        if (isChanged) {
          updateUser(parseRequestData(data)).then(res => {
            if (res.data) {
              setIsEdit(false);
            }
          });
        }
      } catch {
        console.log('error');
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSaveChanges)}>
        <Box
          sx={{
            bgcolor: 'white',
            position: 'relative',
            borderTopLeftRadius: '32px',
            borderBottomLeftRadius: '32px',
            borderBottomRightRadius: '32px',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '250px',
              position: 'relative',
              backgroundSize: 'cover',
              borderTopLeftRadius: '32px',
              backgroundPosition: 'center ',
              backgroundRepeat: 'no-repeat',
              backgroundImage: 'url(cosmetic.jpg)',
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                padding: 4,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <SideBarButton />
              <CurrentUser />
            </Stack>

            {!id && isEdit && (
              <IconButton sx={{ position: 'absolute', bottom: 32, right: 32 }}>
                <Upload />
              </IconButton>
            )}
          </Box>

          <Stack
            direction="row"
            sx={{
              p: 4,
              mt: -10,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                gap: 2,
                width: '100%',
                alignItems: 'start',
                justifyContent: 'space-between',
              }}
            >
              <UserCard isLoading={isLoading} />

              <Stack
                spacing={2}
                direction="column"
                sx={{
                  width: '100%',
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: '100px !important',
                  }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                  >
                    <Tab label="Медиа" />
                    <Tab label="Обо мне" />
                    <Tab label="Контакты" />
                  </Tabs>

                  <ActionButton
                    handleEdit={handleEdit}
                    handleCancelEdit={handleCancelEdit}
                  />
                </Stack>

                <Content
                  isLoading={isLoading}
                  tabValue={tabValue}
                  contacts={user?.data?.contacts}
                />
              </Stack>
            </Stack>
          </Stack>

          <Backdrop
            open={isLoading}
            sx={{ zIndex: 1000 }}
          >
            <CircularProgress />
          </Backdrop>
        </Box>
      </form>
    </FormProvider>
  );
};

export default ProfilePage;
