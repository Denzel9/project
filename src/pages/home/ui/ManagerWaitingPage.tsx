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
import { PageLayout, useSnackbarStore } from '@/widgets';

const formatAddedAt = (value?: string) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'd MMMM yyyy', { locale: ru });
  } catch {
    return value;
  }
};

export const ManagerWaitingPage = () => {
  const navigate = useNavigate();
  const { id, setAuth } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();
  const { data, isLoading } = useGetProfilesQuery();
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
    <PageLayout>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          borderRadius: '32px',
          p: { xs: 3, md: 6 },
        }}
      >
        <Stack
          spacing={3}
          sx={{ maxWidth: 560, width: '100%' }}
        >
          {isLoading ? (
            <Stack spacing={1}>
              <Skeleton
                variant="rounded"
                height={32}
              />
              <Skeleton
                variant="rounded"
                height={72}
              />
            </Stack>
          ) : managedProfiles.length === 0 ? (
            <Stack
              spacing={2}
              sx={{ textAlign: 'center' }}
            >
              <Typography variant="h5">Ожидайте приглашения</Typography>
              <Typography
                variant="body1"
                color="text.secondary"
              >
                Профиль менеджера станет активным после того, как вас добавят к
                управлению компанией или профилем исполнителя. До этого
                публикации, отклики и чат недоступны.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(ROUTES.SETTINGS_PROFILES)}
              >
                Перейти к профилям
              </Button>
            </Stack>
          ) : (
            <>
              <Stack
                spacing={1}
                sx={{ textAlign: 'center' }}
              >
                <Typography variant="h5">Доступные профили</Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                >
                  Переключитесь на профиль, чтобы открыть ленту и функции
                  платформы.
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                {managedProfiles.map(profile => {
                  const roleLabel = profile.role
                    ? ProfileRoleLabels[profile.role]
                    : '';

                  return (
                    <Box
                      key={profile.userId ?? profile.id}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: 'divider',
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
                          <Typography sx={{ fontWeight: 600 }}>
                            {roleLabel || profile.displayName || 'Профиль'}
                          </Typography>
                          {profile.displayName && roleLabel && (
                            <Chip
                              size="small"
                              label={profile.displayName}
                            />
                          )}
                        </Stack>
                        {profile.actorName && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {profile.actorName}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ wordBreak: 'break-all' }}
                        >
                          ID: {profile.userId}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Добавлен: {formatAddedAt(profile.createdAt)}
                        </Typography>
                      </Stack>

                      <Button
                        variant="contained"
                        disabled={isPending}
                        onClick={() => handleSwitch(profile.userId || '')}
                      >
                        Переключить
                      </Button>
                    </Box>
                  );
                })}
              </Stack>

              <Button
                variant="text"
                onClick={() => navigate(ROUTES.SETTINGS_PROFILES)}
              >
                Открыть в настройках
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </PageLayout>
  );
};

export default ManagerWaitingPage;
