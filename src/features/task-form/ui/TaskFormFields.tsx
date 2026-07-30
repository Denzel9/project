import { SyncOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { isPast, startOfDay } from 'date-fns';
import { useFormContext, useWatch } from 'react-hook-form';

import { TASK_STATUS_ENUM, type TaskStatus } from '@/entities';
import { RHFDateTimePicker, RHFInput } from '@/shared';

import { RequirementCard } from './RequirementCard';
import { TaskTzSections } from './task-tz-sections';
import { TaskPostBrief } from './TaskPostBrief';

import type { TaskFormType } from '../model/schema/schema';
import type { Post } from '@/entities/post';

type TaskFormFieldsProps = {
  isMe: boolean;
  isEdit: boolean;
  status: TaskStatus;
  post?: Post;
  showPrefillHint?: boolean;
  onStartEdit: () => void;
  onApplyFromPost?: () => void;
};

const SectionTitle = ({ children }: { children: string }) => (
  <Typography
    variant="subtitle2"
    sx={{ fontWeight: 600, color: 'info.main' }}
  >
    {children}
  </Typography>
);

const isDeadlineOverdue = (
  finalDate: string | null | undefined,
  status: TaskStatus
) => {
  if (!finalDate) return false;

  const isTerminal =
    status === TASK_STATUS_ENUM.COMPLETED ||
    status === TASK_STATUS_ENUM.CANCELLED ||
    status === TASK_STATUS_ENUM.CANCELLED_EXECUTOR;

  return !isTerminal && isPast(startOfDay(new Date(finalDate)));
};

export const TaskFormFields = ({
  isMe,
  status,
  isEdit,
  post,
  showPrefillHint,
  onStartEdit,
  onApplyFromPost,
}: TaskFormFieldsProps) => {
  const { control } = useFormContext<TaskFormType>();

  const { title, photoCount, videoCount, finalDate } = useWatch({
    control,
  });

  const isCancelled = [
    TASK_STATUS_ENUM.CANCELLED,
    TASK_STATUS_ENUM.CANCELLED_EXECUTOR,
  ].includes(status as TASK_STATUS_ENUM);

  const isEditEnabled = isEdit && !isCancelled;
  const isOverdue = isDeadlineOverdue(finalDate, status);
  const canEditForm =
    isMe &&
    (status === TASK_STATUS_ENUM.PREPARING ||
      status === TASK_STATUS_ENUM.REVISION);
  const canApplyFromPost = canEditForm && onApplyFromPost;

  const handleStartEdit = () => {
    if (canEditForm) {
      onStartEdit();
    }
  };

  return (
    <Stack spacing={3}>
      {post && <TaskPostBrief post={post} />}

      <Box>
        <Stack
          direction="row"
          sx={{
            mb: 1.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <SectionTitle>Параметры задания</SectionTitle>

          {canApplyFromPost && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SyncOutlined />}
              onClick={onApplyFromPost}
            >
              Заполнить из объявления
            </Button>
          )}
        </Stack>

        {showPrefillHint && canApplyFromPost && (
          <Alert
            severity="info"
            sx={{ mb: 2, borderRadius: '16px', color: 'info.main' }}
          >
            Нажмите «Заполнить из объявления», чтобы подставить данные из поста.
          </Alert>
        )}

        <Stack spacing={4}>
          {isEditEnabled ? (
            <RHFInput
              name="title"
              control={control}
              props={{
                label: 'Заголовок',
                fullWidth: true,
              }}
            />
          ) : title?.trim() ? (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                cursor: canEditForm ? 'pointer' : 'default',
              }}
              onClick={handleStartEdit}
            >
              {title}
            </Typography>
          ) : canEditForm ? (
            <Typography
              variant="body1"
              onClick={handleStartEdit}
              sx={{
                color: 'info.main',
                fontWeight: 500,
                cursor: 'pointer',
                ':hover': { color: 'primary.main' },
              }}
            >
              Добавить заголовок
            </Typography>
          ) : null}

          {(Number(photoCount) > 0 ||
            Number(videoCount) > 0 ||
            Boolean(finalDate)) && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
            >
              {photoCount && Number(photoCount) > 0 && (
                <RequirementCard
                  isEdit={isEdit}
                  icon="photo"
                  label="Фото"
                  value={photoCount}
                  onEdit={handleStartEdit}
                  canEdit={canEditForm}
                  placeholder="Указать количество"
                  emptyReadOnlyLabel={isMe ? undefined : '—'}
                >
                  {isEditEnabled ? (
                    <RHFInput
                      name="photoCount"
                      control={control}
                      props={{
                        size: 'small',
                        sx: { mt: 0.5 },
                        label: 'Кол-во фото',
                      }}
                    />
                  ) : undefined}
                </RequirementCard>
              )}

              {videoCount && Number(videoCount) > 0 && (
                <RequirementCard
                  isEdit={isEdit}
                  icon="video"
                  label="Видео"
                  value={videoCount}
                  onEdit={handleStartEdit}
                  canEdit={canEditForm}
                  placeholder="Указать количество"
                  emptyReadOnlyLabel={isMe ? undefined : '—'}
                >
                  {isEditEnabled ? (
                    <RHFInput
                      name="videoCount"
                      control={control}
                      props={{
                        size: 'small',
                        sx: { mt: 0.5 },
                        label: 'Кол-во видео',
                      }}
                    />
                  ) : undefined}
                </RequirementCard>
              )}

              {finalDate && (
                <RequirementCard
                  isEdit={isEdit}
                  icon="deadline"
                  label="Дедлайн"
                  value={finalDate}
                  error={isOverdue}
                  onEdit={handleStartEdit}
                  placeholder="Указать дату"
                  canEdit={canEditForm}
                >
                  {isEditEnabled ? (
                    <Box sx={{ mt: 0.5 }}>
                      <RHFDateTimePicker
                        size="small"
                        label="Дедлайн"
                        name="finalDate"
                        control={control}
                      />
                    </Box>
                  ) : undefined}
                </RequirementCard>
              )}
            </Stack>
          )}
        </Stack>
      </Box>

      <TaskTzSections
        isEdit={isEditEnabled}
        canEdit={canEditForm}
        onEdit={handleStartEdit}
      />
    </Stack>
  );
};
