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

import {
  ProfileRoleLabels,
  isManagedProfile,
  useGetProfilesQuery,
} from '@/entities/workspace-member';
import { useAuthStore, useSwitchActiveProfile } from '@/features/auth';
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
  const { id } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();
  const { data, isLoading, isError } = useGetProfilesQuery();
  const { switchActiveProfile, isPending } = useSwitchActiveProfile();

  const managedProfiles = useMemo(
    () => (data?.data ?? []).filter(isManagedProfile),
    [data?.data]
  );

  const handleSwitch = async (userId: string) => {
    if (!userId || userId === id) return;

    const switched = await switchActiveProfile(userId);

    if (!switched) return;

    setSnackbarOpen?.(true, 'Профиль успешно переключён');
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
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={88} />
          <Skeleton variant="rounded" height={88} />
        </Stack>
      )}

      {isError && (
        <Typography color="error" variant="body2">
          Не удалось загрузить профили
        </Typography>
      )}

      {!isLoading && !isError && managedProfiles.length === 0 && (
        <Typography color="text.secondary" variant="body2">
          Пока нет доступных профилей. Примите приглашение к управлению
          компанией или исполнителем.
        </Typography>
      )}

      <Stack spacing={1.5}>
        {managedProfiles.map(profile => {
          const isActive = profile.userId === id;
          const roleLabel = profile.role
            ? ProfileRoleLabels[profile.role]
            : 'Профиль';

          return (
            <Box
              key={profile.id}
              sx={{
                p: 2,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isActive ? 'primary.main' : 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                      {profile.displayName || roleLabel}
                    </Typography>
                    {isActive && (
                      <Chip size="small" color="primary" label="Активный" />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {roleLabel}
                    {profile.actorName ? ` · ${profile.actorName}` : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Добавлен: {formatAddedAt(profile.createdAt)}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  {!isActive && (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={isPending}
                      onClick={() => void handleSwitch(profile.userId || '')}
                    >
                      Переключить
                    </Button>
                  )}
                  {isActive && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(ROUTES.INDEX)}
                    >
                      На главную
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default SettingsProfilesPage;

