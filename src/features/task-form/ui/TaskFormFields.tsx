import { SyncOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import { TASK_STATUS_ENUM, type TaskStatus } from '@/entities';
import { RHFDateTimePicker, RHFInput } from '@/shared';

import { RequirementCard } from './RequirementCard';
import { TaskPostBrief } from './TaskPostBrief';
import { TaskTzSections } from './TaskTzSections';

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

  const handleStartEdit = () => {
    if (isMe && !isCancelled) {
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

          {isMe && !isCancelled && onApplyFromPost && (
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

        {showPrefillHint && (
          <Alert
            severity="info"
            sx={{ mb: 2, borderRadius: '16px' }}
          >
            Нажмите «Заполнить из объявления», чтобы подставить данные из поста.
          </Alert>
        )}

        <Stack spacing={4}>
          <Box>
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
                sx={{ fontWeight: 600, cursor: isMe ? 'pointer' : 'default' }}
                onClick={handleStartEdit}
              >
                {title}
              </Typography>
            ) : isMe ? (
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
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
          >
            <RequirementCard
              isEdit={isEdit}
              icon="photo"
              label="Фото"
              value={photoCount}
              canEdit={isMe && !isCancelled}
              placeholder="Указать количество"
              emptyReadOnlyLabel={isMe ? undefined : '—'}
              onEdit={handleStartEdit}
            >
              {isEditEnabled ? (
                <RHFInput
                  name="photoCount"
                  control={control}
                  props={{
                    label: 'Кол-во фото',
                    size: 'small',
                    fullWidth: true,
                    sx: { mt: 0.5 },
                  }}
                />
              ) : undefined}
            </RequirementCard>

            <RequirementCard
              isEdit={isEdit}
              icon="video"
              label="Видео"
              value={videoCount}
              canEdit={isMe && !isCancelled}
              placeholder="Указать количество"
              emptyReadOnlyLabel={isMe ? undefined : '—'}
              onEdit={handleStartEdit}
            >
              {isEditEnabled ? (
                <RHFInput
                  name="videoCount"
                  control={control}
                  props={{
                    label: 'Кол-во видео',
                    size: 'small',
                    fullWidth: true,
                    sx: { mt: 0.5 },
                  }}
                />
              ) : undefined}
            </RequirementCard>

            <RequirementCard
              isEdit={isEdit}
              icon="deadline"
              label="Дедлайн"
              value={finalDate}
              canEdit={isMe && !isCancelled}
              placeholder="Указать дату"
              onEdit={handleStartEdit}
            >
              {isEditEnabled ? (
                <Box sx={{ mt: 0.5 }}>
                  <RHFDateTimePicker
                    name="finalDate"
                    label="Дедлайн"
                    size="small"
                    control={control}
                  />
                </Box>
              ) : undefined}
            </RequirementCard>
          </Stack>
        </Stack>
      </Box>

      <TaskTzSections
        isMe={isMe}
        isEdit={isEditEnabled}
        onEdit={handleStartEdit}
      />
    </Stack>
  );
};
