import {
  Box,
  Button,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { prefetchUserConfig } from '@/entities/user-config';
import {
  ProfileRoleLabels,
  isManagedProfile,
  useGetProfilesQuery,
  useSwitchProfileMutation,
} from '@/entities/workspace-member';
import { mapAuthSessionUser, useAuthStore } from '@/features/auth';
import { queryClient } from '@/shared/api';
import { ROUTES } from '@/shared/config/routes';
import { useSnackbarStore } from '@/widgets';

const formatAddedAt = (value?: string) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'd MMMM yyyy', { locale: ru });
  } catch {
    return value;
  }
};

export const SettingsProfilesPage = () => {
  const navigate = useNavigate();
  const { id, setAuth } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();
  const { data, isLoading, isError } = useGetProfilesQuery();
  const { mutateAsync: switchProfile, isPending } = useSwitchProfileMutation();

  const managedProfiles = useMemo(
    () => (data?.data ?? []).filter(isManagedProfile),
    [data?.data]
  );

  const handleSwitch = async (userId: string) => {
    if (!userId || userId === id) return;

    const res = await switchProfile(userId);
    const user = res.data.user;
    if (!user?.id) return;

    setAuth(mapAuthSessionUser(user));

    try {
      await prefetchUserConfig(queryClient);
    } catch {
      // конфиг подтянется позже
    }

    setSnackbarOpen?.(true, 'Профиль успешно переключён');
    navigate(ROUTES.INDEX);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Профили</Typography>
        <Typography
          variant="body2"
          color="info"
          sx={{ mt: 1 }}
        >
          Компании и исполнители, к управлению которыми вас добавили.
          Переключитесь на профиль, чтобы открыть ленту и функции платформы.
        </Typography>
      </Box>

      {isLoading && (
        <Stack spacing={1}>
          {[1, 2, 3].map(item => (
            <Skeleton
              key={item}
              variant="rounded"
              height={88}
              sx={{ borderRadius: '16px' }}
            />
          ))}
        </Stack>
      )}

      {!isLoading && (isError || managedProfiles.length === 0) && (
        <Box
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            bgcolor: 'secondary.light',
            borderRadius: '24px',
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
          >
            Пока нет доступных профилей.
            <br />
            Дождитесь приглашения к управлению.
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && managedProfiles.length > 0 && (
        <Stack spacing={1.5}>
          {managedProfiles.map(profile => {
            const isActive = profile.userId === id;
            const roleLabel = profile.role
              ? ProfileRoleLabels[profile.role]
              : '';

            return (
              <Box
                key={profile.userId ?? profile.id}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isActive ? 'secondary.light' : 'transparent',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600 }}
                    >
                      {profile.displayName || roleLabel || 'Без названия'}
                    </Typography>
                    {roleLabel && (
                      <Chip
                        size="small"
                        label={roleLabel}
                      />
                    )}
                    {isActive && (
                      <Chip
                        size="small"
                        color="primary"
                        label="Активный"
                      />
                    )}
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Добавлен: {formatAddedAt(profile.createdAt)}
                  </Typography>
                </Stack>

                <Button
                  variant={isActive ? 'outlined' : 'contained'}
                  disabled={isActive || isPending}
                  onClick={() => handleSwitch(profile.userId || '')}
                >
                  {isActive ? 'Текущий' : 'Переключиться'}
                </Button>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

export default SettingsProfilesPage;
