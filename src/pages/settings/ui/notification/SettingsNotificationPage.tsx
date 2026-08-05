import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import {
  getNotificationTypeLabel,
  NOTIFICATION_TYPE,
  type NotificationType,
} from '@/entities/notification';
import { USER_ROLE } from '@/entities/user';
import {
  useUpdateUserConfigMutation,
  useUserConfigQuery,
} from '@/entities/user-config';
import { useAuthStore } from '@/features';
import { EmptyBlock } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import {
  ALL_NOTIFICATION_TYPES,
  NOTIFICATION_SETTINGS_GROUPS,
} from '../../model/constants/notificationSettings';
import { SettingsRow } from '../SettingsRow';

const CHAT_CHANNEL_HINT =
  'Сообщения по чату только если вы offline; не чаще раза в 10 мин.';

const MANAGER_HIDDEN_NOTIFICATION_GROUPS = new Set([
  'applications',
  'tasks',
  'publications',
]);

const areSameTypes = (left: NotificationType[], right: NotificationType[]) => {
  if (left.length !== right.length) return false;

  const rightSet = new Set(right);

  return left.every(type => rightSet.has(type));
};

type ChannelSectionProps = {
  title: string;
  description: string;
  selectedTypes: NotificationType[];
  savedTypes: NotificationType[];
  groups: typeof NOTIFICATION_SETTINGS_GROUPS;
  isEditing: boolean;
  isPending: boolean;
  showChatHint?: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onToggle: (type: NotificationType, checked: boolean) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
  onSave: () => void;
};

const ChannelSection = ({
  title,
  description,
  selectedTypes,
  savedTypes,
  groups,
  isEditing,
  isPending,
  showChatHint = false,
  onStartEdit,
  onCancelEdit,
  onToggle,
  onEnableAll,
  onDisableAll,
  onSave,
}: ChannelSectionProps) => {
  const selectedSet = useMemo(() => new Set(selectedTypes), [selectedTypes]);
  const visibleTypeSet = useMemo(
    () => new Set(groups.flatMap(group => group.types)),
    [groups]
  );
  const isDirty = !areSameTypes(
    selectedTypes.filter(type => visibleTypeSet.has(type)),
    savedTypes.filter(type => visibleTypeSet.has(type))
  );

  return (
    <Stack spacing={2}>
      <SettingsRow
        title={title}
        description={description}
        action={
          <Button
            variant="outlined"
            color="primary"
            onClick={isEditing ? onCancelEdit : onStartEdit}
          >
            {isEditing ? 'Отмена' : 'Редактировать'}
          </Button>
        }
      />

      <Collapse
        in={isEditing}
        sx={{ mt: isEditing ? 2 : '0px !important' }}
      >
        <Stack
          spacing={3}
          sx={{ pt: 1 }}
        >
          {groups.map(group => (
            <Stack
              key={group.id}
              spacing={1.5}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {group.title}
              </Typography>

              <Stack spacing={1}>
                {group.types.map(type => {
                  const isChatHint =
                    showChatHint && type === NOTIFICATION_TYPE.CHAT_MESSAGE;

                  return (
                    <FormControlLabel
                      key={type}
                      sx={{
                        alignItems: isChatHint ? 'flex-start' : 'center',
                      }}
                      control={
                        <Checkbox
                          checked={selectedSet.has(type)}
                          disabled={isPending}
                          onChange={event =>
                            onToggle(type, event.target.checked)
                          }
                          sx={isChatHint ? { pt: 0.5 } : undefined}
                        />
                      }
                      label={
                        isChatHint ? (
                          <Stack spacing={0.25}>
                            <Typography variant="body2">
                              {getNotificationTypeLabel(type)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {CHAT_CHANNEL_HINT}
                            </Typography>
                          </Stack>
                        ) : (
                          getNotificationTypeLabel(type)
                        )
                      }
                    />
                  );
                })}
              </Stack>
            </Stack>
          ))}

          <Stack
            spacing={1}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            <Button
              size="small"
              variant="outlined"
              disabled={isPending}
              onClick={onEnableAll}
            >
              Включить все
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={isPending || selectedTypes.length === 0}
              onClick={onDisableAll}
            >
              Выключить все
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={isPending}
              onClick={onCancelEdit}
            >
              Отмена
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={!isDirty || isPending}
              onClick={onSave}
              startIcon={
                isPending ? (
                  <CircularProgress
                    size={14}
                    color="inherit"
                  />
                ) : undefined
              }
            >
              Сохранить
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
};

type ChannelKey = 'inApp' | 'email' | 'telegram' | 'max';

export const SettingsNotificationPage = () => {
  const { isAuth, role } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();
  const isManager = role === USER_ROLE.MANAGER;

  const visibleGroups = useMemo(
    () =>
      isManager
        ? NOTIFICATION_SETTINGS_GROUPS.filter(
          group => !MANAGER_HIDDEN_NOTIFICATION_GROUPS.has(group.id)
        )
        : NOTIFICATION_SETTINGS_GROUPS,
    [isManager]
  );

  const visibleTypes = useMemo(
    () => visibleGroups.flatMap(group => group.types),
    [visibleGroups]
  );

  const hiddenTypes = useMemo(() => {
    if (!isManager) return [] as NotificationType[];
    const visibleSet = new Set(visibleTypes);
    return ALL_NOTIFICATION_TYPES.filter(type => !visibleSet.has(type));
  }, [isManager, visibleTypes]);

  const mergeWithHidden = (
    selected: NotificationType[],
    saved: NotificationType[]
  ) => {
    if (!isManager) return selected;
    const preserved = saved.filter(type => hiddenTypes.includes(type));
    const nextVisible = selected.filter(type => visibleTypes.includes(type));
    return [...new Set([...preserved, ...nextVisible])];
  };

  const { data, isLoading, isError, refetch } = useUserConfigQuery({
    enabled: isAuth,
  });

  const { mutateAsync: updateConfig, isPending } =
    useUpdateUserConfigMutation();

  const [editingChannel, setEditingChannel] = useState<ChannelKey | null>(null);
  const [inAppTypes, setInAppTypes] = useState<NotificationType[]>([]);
  const [emailTypes, setEmailTypes] = useState<NotificationType[]>([]);
  const [telegramTypes, setTelegramTypes] = useState<NotificationType[]>([]);
  const [maxTypes, setMaxTypes] = useState<NotificationType[]>([]);

  useEffect(() => {
    if (!data) return;

    setTimeout(() => {
      setInAppTypes(data.inAppNotificationTypes ?? []);
      setEmailTypes(data.emailNotificationTypes ?? []);
      setTelegramTypes(data.telegramNotificationTypes ?? []);
      setMaxTypes(data.maxNotificationTypes ?? []);
    }, 0);
  }, [data]);

  const toggleInList = (
    setter: typeof setInAppTypes,
    type: NotificationType,
    checked: boolean
  ) => {
    setter(current => {
      if (checked) {
        return current.includes(type) ? current : [...current, type];
      }

      return current.filter(item => item !== type);
    });
  };

  const handleSave = async (
    channel: ChannelKey,
    types: NotificationType[],
    close: () => void
  ) => {
    try {
      const saved =
        channel === 'inApp'
          ? (data?.inAppNotificationTypes ?? [])
          : channel === 'email'
            ? (data?.emailNotificationTypes ?? [])
            : channel === 'telegram'
              ? (data?.telegramNotificationTypes ?? [])
              : (data?.maxNotificationTypes ?? []);

      const mergedTypes = mergeWithHidden(types, saved);

      const payload =
        channel === 'inApp'
          ? { inAppNotificationTypes: mergedTypes }
          : channel === 'email'
            ? { emailNotificationTypes: mergedTypes }
            : channel === 'telegram'
              ? { telegramNotificationTypes: mergedTypes }
              : { maxNotificationTypes: mergedTypes };

      const next = await updateConfig(payload);

      setInAppTypes(next.inAppNotificationTypes ?? []);
      setEmailTypes(next.emailNotificationTypes ?? []);
      setTelegramTypes(next.telegramNotificationTypes ?? []);
      setMaxTypes(next.maxNotificationTypes ?? []);
      close();
      setSnackbarOpen(true, 'Настройки уведомлений сохранены');
    } catch {
      setSnackbarOpen(true, 'Не удалось сохранить настройки');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <EmptyBlock
          title="Не удалось загрузить настройки уведомлений"
          buttonText="Повторить"
          buttonOnClick={() => void refetch()}
        />
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Уведомления
      </Typography>

      <ChannelSection
        title="В приложении"
        description="Показываются в колокольчике в шапке и приходят в реальном времени, пока вы в системе."
        selectedTypes={inAppTypes}
        savedTypes={data.inAppNotificationTypes ?? []}
        groups={visibleGroups}
        isEditing={editingChannel === 'inApp'}
        isPending={isPending}
        onStartEdit={() => {
          setInAppTypes(data.inAppNotificationTypes ?? []);
          setEditingChannel('inApp');
        }}
        onCancelEdit={() => {
          setInAppTypes(data.inAppNotificationTypes ?? []);
          setEditingChannel(null);
        }}
        onToggle={(type, checked) => toggleInList(setInAppTypes, type, checked)}
        onEnableAll={() => setInAppTypes([...visibleTypes])}
        onDisableAll={() => setInAppTypes([])}
        onSave={() =>
          void handleSave('inApp', inAppTypes, () => setEditingChannel(null))
        }
      />

      <ChannelSection
        title="На почту"
        description="Письма о новых откликах, задачах, сообщениях в чате и изменениях доступа."
        selectedTypes={emailTypes}
        savedTypes={data.emailNotificationTypes ?? []}
        groups={visibleGroups}
        isEditing={editingChannel === 'email'}
        isPending={isPending}
        showChatHint
        onStartEdit={() => {
          setEmailTypes(data.emailNotificationTypes ?? []);
          setEditingChannel('email');
        }}
        onCancelEdit={() => {
          setEmailTypes(data.emailNotificationTypes ?? []);
          setEditingChannel(null);
        }}
        onToggle={(type, checked) => toggleInList(setEmailTypes, type, checked)}
        onEnableAll={() => setEmailTypes([...visibleTypes])}
        onDisableAll={() => setEmailTypes([])}
        onSave={() =>
          void handleSave('email', emailTypes, () => setEditingChannel(null))
        }
      />

      <ChannelSection
        title="Telegram"
        description="Сообщения бота после подключения в разделе «Приложения»."
        selectedTypes={telegramTypes}
        savedTypes={data.telegramNotificationTypes ?? []}
        groups={visibleGroups}
        isEditing={editingChannel === 'telegram'}
        isPending={isPending}
        showChatHint
        onStartEdit={() => {
          setTelegramTypes(data.telegramNotificationTypes ?? []);
          setEditingChannel('telegram');
        }}
        onCancelEdit={() => {
          setTelegramTypes(data.telegramNotificationTypes ?? []);
          setEditingChannel(null);
        }}
        onToggle={(type, checked) =>
          toggleInList(setTelegramTypes, type, checked)
        }
        onEnableAll={() => setTelegramTypes([...visibleTypes])}
        onDisableAll={() => setTelegramTypes([])}
        onSave={() =>
          void handleSave('telegram', telegramTypes, () =>
            setEditingChannel(null)
          )
        }
      />

      <ChannelSection
        title="MAX"
        description="Сообщения бота MAX после подключения в разделе «Приложения»."
        selectedTypes={maxTypes}
        savedTypes={data.maxNotificationTypes ?? []}
        groups={visibleGroups}
        isEditing={editingChannel === 'max'}
        isPending={isPending}
        showChatHint
        onStartEdit={() => {
          setMaxTypes(data.maxNotificationTypes ?? []);
          setEditingChannel('max');
        }}
        onCancelEdit={() => {
          setMaxTypes(data.maxNotificationTypes ?? []);
          setEditingChannel(null);
        }}
        onToggle={(type, checked) => toggleInList(setMaxTypes, type, checked)}
        onEnableAll={() => setMaxTypes([...visibleTypes])}
        onDisableAll={() => setMaxTypes([])}
        onSave={() =>
          void handleSave('max', maxTypes, () => setEditingChannel(null))
        }
      />
    </Stack>
  );
};

export default SettingsNotificationPage;
