import { Box, Stack } from '@mui/material';
import { isPast, startOfDay } from 'date-fns';
import { useFormContext, useWatch } from 'react-hook-form';

import { TASK_STATUS_ENUM, type TaskStatus } from '@/entities';
import { RHFDateTimePicker, RHFInput } from '@/shared';

import { RequirementCard } from './RequirementCard';

import type { TaskFormType } from '../model/schema/schema';

type TaskRequirementsFieldsProps = {
  isMe: boolean;
  isEdit: boolean;
  status: TaskStatus;
  isEditEnabled: boolean;
  canEditForm: boolean;
  onStartEdit: () => void;
};

const isDeadlineOverdue = (
  finalDate: string | null | undefined,
  status: TaskStatus
) => {
  if (!finalDate) return false;

  const isTerminal =
    status === TASK_STATUS_ENUM.COMPLETED ||
    status === TASK_STATUS_ENUM.ANNULLED;

  return !isTerminal && isPast(startOfDay(new Date(finalDate)));
};

export const TaskRequirementsFields = ({
  isMe,
  isEdit,
  status,
  isEditEnabled,
  canEditForm,
  onStartEdit,
}: TaskRequirementsFieldsProps) => {
  const { control } = useFormContext<TaskFormType>();

  const { photoCount, videoCount, finalDate } = useWatch({
    control,
  });

  const isOverdue = isDeadlineOverdue(finalDate, status);
  const hasVisibleRequirements =
    Number(photoCount) > 0 ||
    Number(videoCount) > 0 ||
    Boolean(finalDate) ||
    isEdit;

  if (!hasVisibleRequirements) return null;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
    >
      {(Number(photoCount) > 0 || isEdit) && (
        <RequirementCard
          isEdit={isEdit}
          icon="photo"
          label="Фото"
          value={photoCount}
          onEdit={onStartEdit}
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

      {(Number(videoCount) > 0 || isEdit) && (
        <RequirementCard
          isEdit={isEdit}
          icon="video"
          label="Видео"
          value={videoCount}
          onEdit={onStartEdit}
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

      {(finalDate ||
        (isEdit &&
          (status === TASK_STATUS_ENUM.PREPARING ||
            status === TASK_STATUS_ENUM.REVISION))) && (
          <RequirementCard
            icon="deadline"
            isEdit={isEdit}
            value={finalDate}
            error={isOverdue}
            canEdit={canEditForm}
            onEdit={onStartEdit}
            placeholder="Указать дату"
            label={isEdit ? undefined : 'Дедлайн'}
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
  );
};
