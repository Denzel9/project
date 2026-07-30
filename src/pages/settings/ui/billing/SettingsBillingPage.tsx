import { Button, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import {
  useActivateSubscriptionMutation,
  useDeactivateSubscriptionMutation,
  useSubscriptionQuery,
} from '@/entities/billing';
import { useAuthStore } from '@/features/auth';
import { useSnackbarStore } from '@/widgets';

import { SettingsRow } from '../SettingsRow';

const STATUS_LABELS: Record<string, string> = {
  NONE: 'Нет подписки',
  ACTIVE: 'Активна',
  EXPIRED: 'Истекла',
  CANCELED: 'Отменена',
};

export const SettingsBillingPage = () => {
  const { isPrime, membershipRole } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();
  const { data, isLoading, isError, refetch } = useSubscriptionQuery();
  const { mutateAsync: activate, isPending: isActivating } =
    useActivateSubscriptionMutation();
  const { mutateAsync: deactivate, isPending: isDeactivating } =
    useDeactivateSubscriptionMutation();

  const canManage =
    membershipRole === 'OWNER' || membershipRole === 'ADMIN';

  const status = data?.status ?? (isPrime ? 'ACTIVE' : 'NONE');
  const expiresAt = data?.expiresAt ?? null;
  const isActive = data?.isPrime ?? isPrime;
  const isPending = isActivating || isDeactivating;

  const handleActivate = async () => {
    try {
      await activate({});
      setSnackbarOpen(true, 'Prime-подписка активирована');
    } catch {
      setSnackbarOpen(true, 'Не удалось активировать подписку');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivate();
      setSnackbarOpen(true, 'Prime-подписка отключена');
    } catch {
      setSnackbarOpen(true, 'Не удалось отключить подписку');
    }
  };

  return (
    <Stack spacing={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Платежи
      </Typography>

      <SettingsRow
        title="Prime-подписка"
        description={
          isActive
            ? 'У текущего профиля активен доступ к CRM и связанным функциям.'
            : 'Подключите Prime для этого профиля, чтобы открыть CRM, задачи, календарь и публикации.'
        }
        action={
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center' }}
          >
            <Chip
              size="small"
              color={isActive ? 'success' : 'default'}
              label={
                isLoading
                  ? 'Загрузка…'
                  : isError
                    ? 'Ошибка'
                    : (STATUS_LABELS[status] ?? status)
              }
            />
            {isError && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => void refetch()}
              >
                Повторить
              </Button>
            )}
          </Stack>
        }
      />

      {expiresAt && isActive && (
        <SettingsRow
          title="Действует до"
          description={format(new Date(expiresAt), 'd MMMM yyyy', {
            locale: ru,
          })}
        />
      )}

      <SettingsRow
        title={isActive ? 'Продлить' : 'Подключить Prime'}
        description={
          canManage
            ? 'Временная активация без оплаты (stub) для текущего профиля.'
            : 'Активировать подписку может только OWNER или ADMIN.'
        }
        action={
          <Button
            variant="contained"
            color="primary"
            disabled={!canManage || isPending || isLoading}
            onClick={() => void handleActivate()}
          >
            {isActive ? 'Продлить' : 'Подключить'}
          </Button>
        }
      />

      {isActive && (
        <SettingsRow
          title="Отключить Prime"
          description={
            canManage
              ? 'Временный stub: снимает Prime только у текущего профиля.'
              : 'Отключить подписку может только OWNER или ADMIN.'
          }
          action={
            <Button
              variant="outlined"
              color="error"
              disabled={!canManage || isPending || isLoading}
              onClick={() => void handleDeactivate()}
            >
              Отключить
            </Button>
          }
        />
      )}
    </Stack>
  );
};

export default SettingsBillingPage;
