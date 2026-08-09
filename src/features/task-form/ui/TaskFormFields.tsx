import { SyncOutlined } from '@mui/icons-material';
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { useFormContext, useWatch, type Control } from 'react-hook-form';

import { TASK_STATUS_ENUM, type TaskStatus } from '@/entities';
import { RHFInput } from '@/shared';

import { TaskTzSections } from './task-tz-sections';
import { TaskPostBrief } from './TaskPostBrief';
import { TaskRequirementsFields } from './TaskRequirementsFields';

import type { TaskFormType } from '../model/schema/schema';
import type { Post } from '@/entities/post';

type TaskFormFieldsProps = {
  post?: Post;
  isMe: boolean;
  isEdit: boolean;
  status: TaskStatus;
  withExecutor?: boolean;
  onStartEdit: () => void;
  showPrefillHint?: boolean;
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

type TaskTitleFieldProps = {
  title?: string;
  control: Control<TaskFormType>;
  isEditEnabled: boolean;
  canEditForm: boolean;
  onStartEdit: () => void;
};

const TaskTitleField = ({
  title,
  control,
  isEditEnabled,
  canEditForm,
  onStartEdit,
}: TaskTitleFieldProps) => {
  if (isEditEnabled) {
    return (
      <RHFInput
        name="title"
        control={control}
        props={{
          label: 'Заголовок',
          fullWidth: true,
        }}
      />
    );
  }

  if (title?.trim()) {
    return (
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          cursor: canEditForm ? 'pointer' : 'default',
        }}
        onClick={onStartEdit}
      >
        {title}
      </Typography>
    );
  }

  if (!canEditForm) return null;

  return (
    <Typography
      variant="body1"
      onClick={onStartEdit}
      sx={{
        color: 'info.main',
        fontWeight: 500,
        cursor: 'pointer',
        ':hover': { color: 'primary.main' },
      }}
    >
      Добавить заголовок
    </Typography>
  );
};

export const TaskFormFields = ({
  post,
  isMe,
  isEdit,
  status,
  onStartEdit,
  onApplyFromPost,
}: TaskFormFieldsProps) => {
  const { control } = useFormContext<TaskFormType>();

  const { title } = useWatch({
    control,
  });

  const isCancelled = status === TASK_STATUS_ENUM.ANNULLED;

  const isEditEnabled = isEdit && !isCancelled;
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
            <Tooltip title="Заполнить данными из поста">
              <Button
                size="small"
                startIcon={<SyncOutlined />}
                onClick={onApplyFromPost}
                sx={{
                  px: 2,
                }}
              >
                Заполнить из поста
              </Button>
            </Tooltip>
          )}
        </Stack>

        <Stack spacing={4}>
          <TaskTitleField
            title={title}
            control={control}
            canEditForm={canEditForm}
            isEditEnabled={isEditEnabled}
            onStartEdit={handleStartEdit}
          />

          <TaskRequirementsFields
            isMe={isMe}
            isEdit={isEdit}
            status={status}
            canEditForm={canEditForm}
            isEditEnabled={isEditEnabled}
            onStartEdit={handleStartEdit}
          />
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
