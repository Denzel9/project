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

const CHAT_EMAIL_HINT =
  'Письма по чату только если вы offline; не чаще раза в 10 мин.';

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
  isEditing: boolean;
  isPending: boolean;
  showChatEmailHint?: boolean;
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
  isEditing,
  isPending,
  showChatEmailHint = false,
  onStartEdit,
  onCancelEdit,
  onToggle,
  onEnableAll,
  onDisableAll,
  onSave,
}: ChannelSectionProps) => {
  const selectedSet = useMemo(() => new Set(selectedTypes), [selectedTypes]);
  const isDirty = !areSameTypes(selectedTypes, savedTypes);

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
          {NOTIFICATION_SETTINGS_GROUPS.map(group => (
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
                  const isChatEmail =
                    showChatEmailHint &&
                    type === NOTIFICATION_TYPE.CHAT_MESSAGE;

                  return (
                    <FormControlLabel
                      key={type}
                      sx={{
                        alignItems: isChatEmail ? 'flex-start' : 'center',
                      }}
                      control={
                        <Checkbox
                          checked={selectedSet.has(type)}
                          disabled={isPending}
                          onChange={event =>
                            onToggle(type, event.target.checked)
                          }
                          sx={isChatEmail ? { pt: 0.5 } : undefined}
                        />
                      }
                      label={
                        isChatEmail ? (
                          <Stack spacing={0.25}>
                            <Typography variant="body2">
                              {getNotificationTypeLabel(type)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {CHAT_EMAIL_HINT}
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

export const SettingsNotificationPage = () => {
  const { isAuth } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();

  const { data, isLoading, isError, refetch } = useUserConfigQuery({
    enabled: isAuth,
  });

  const { mutateAsync: updateConfig, isPending } =
    useUpdateUserConfigMutation();

  const [isEditingInApp, setIsEditingInApp] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [inAppTypes, setInAppTypes] = useState<NotificationType[]>([]);
  const [emailTypes, setEmailTypes] = useState<NotificationType[]>([]);

  useEffect(() => {
    if (!data) return;

    setTimeout(() => {
      setInAppTypes(data.inAppNotificationTypes ?? []);
      setEmailTypes(data.emailNotificationTypes ?? []);
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

  const handleSaveInApp = async () => {
    try {
      const next = await updateConfig({
        inAppNotificationTypes: inAppTypes,
      });

      setInAppTypes(next.inAppNotificationTypes ?? []);
      setEmailTypes(next.emailNotificationTypes ?? []);
      setIsEditingInApp(false);
      setSnackbarOpen(true, 'Настройки уведомлений сохранены');
    } catch {
      setSnackbarOpen(true, 'Не удалось сохранить настройки');
    }
  };

  const handleSaveEmail = async () => {
    try {
      const next = await updateConfig({
        emailNotificationTypes: emailTypes,
      });

      setInAppTypes(next.inAppNotificationTypes ?? []);
      setEmailTypes(next.emailNotificationTypes ?? []);
      setIsEditingEmail(false);
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
        isEditing={isEditingInApp}
        isPending={isPending}
        onStartEdit={() => {
          setInAppTypes(data.inAppNotificationTypes ?? []);
          setIsEditingInApp(true);
        }}
        onCancelEdit={() => {
          setInAppTypes(data.inAppNotificationTypes ?? []);
          setIsEditingInApp(false);
        }}
        onToggle={(type, checked) => toggleInList(setInAppTypes, type, checked)}
        onEnableAll={() => setInAppTypes([...ALL_NOTIFICATION_TYPES])}
        onDisableAll={() => setInAppTypes([])}
        onSave={() => void handleSaveInApp()}
      />

      <ChannelSection
        title="На почту"
        description="Письма о новых откликах, задачах, сообщениях в чате и изменениях доступа."
        selectedTypes={emailTypes}
        savedTypes={data.emailNotificationTypes ?? []}
        isEditing={isEditingEmail}
        isPending={isPending}
        showChatEmailHint
        onStartEdit={() => {
          setEmailTypes(data.emailNotificationTypes ?? []);
          setIsEditingEmail(true);
        }}
        onCancelEdit={() => {
          setEmailTypes(data.emailNotificationTypes ?? []);
          setIsEditingEmail(false);
        }}
        onToggle={(type, checked) => toggleInList(setEmailTypes, type, checked)}
        onEnableAll={() => setEmailTypes([...ALL_NOTIFICATION_TYPES])}
        onDisableAll={() => setEmailTypes([])}
        onSave={() => void handleSaveEmail()}
      />
    </Stack>
  );
};

export default SettingsNotificationPage;
