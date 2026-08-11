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
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { USER_ROLE } from '@/entities';
import {
  ProfileRoleLabels,
  useGetProfilesQuery,
} from '@/entities/workspace-member';
import { useAuthStore, useSwitchActiveProfile } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';
import { useSnackbarStore } from '@/widgets';

import { AddMemberDialog } from '../members/AddMemberDialog';

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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { id, role } = useAuthStore();
  const isManager = role === USER_ROLE.MANAGER;
  const { setSnackbarOpen } = useSnackbarStore();
  const scope = isManager ? 'companies' : 'linked';
  const { data, isLoading, isError } = useGetProfilesQuery(scope);
  const { switchActiveProfile, isPending } = useSwitchActiveProfile();

  const profiles = data?.data ?? [];

  const handleSwitch = async (userId: string) => {
    if (!userId || userId === id) return;

    const switched = await switchActiveProfile(userId);

    if (!switched) return;

    setSnackbarOpen?.(true, 'Профиль успешно переключён');
  };

  const title = isManager ? 'Компании' : 'Профили';
  const description = isManager
    ? 'Компании и исполнители, к управлению которыми вас добавили. Переключитесь, чтобы открыть ленту и функции платформы.'
    : 'Связанные профили компаний и исполнителей. Добавьте профиль по email или переключитесь на уже связанный.';

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="info"
            sx={{ mt: 1 }}
          >
            {description}
          </Typography>
        </Box>

        {!isManager && (
          <Button
            variant="contained"
            onClick={() => setIsAddOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            Добавить
          </Button>
        )}
      </Stack>

      {isLoading && (
        <Stack spacing={1.5}>
          <Skeleton
            variant="rounded"
            height={88}
          />
          <Skeleton
            variant="rounded"
            height={88}
          />
        </Stack>
      )}

      {isError && (
        <Typography
          color="error"
          variant="body2"
        >
          Не удалось загрузить {isManager ? 'компании' : 'профили'}
        </Typography>
      )}

      {!isLoading && !isError && profiles.length === 0 && (
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {isManager
            ? 'Пока нет доступных компаний. Примите приглашение к управлению.'
            : 'Связанных профилей пока нет. Добавьте профиль по email.'}
        </Typography>
      )}

      <Stack spacing={1.5}>
        {profiles.map(profile => {
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
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', mb: 0.5 }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600 }}
                      noWrap
                    >
                      {profile.displayName || roleLabel}
                    </Typography>
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
                    {roleLabel}
                    {profile.actorName ? ` · ${profile.actorName}` : ''}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Добавлен: {formatAddedAt(profile.createdAt)}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                >
                  {!isActive && profile.canSwitch !== false && (
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

      {isAddOpen && !isManager && (
        <AddMemberDialog
          open={isAddOpen}
          kind="CROSS"
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </Stack>
  );
};

export default SettingsProfilesPage;
