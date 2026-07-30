import { Box, Stack, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { MarkdownContent, RHFRichTextEditor } from '@/shared';

import type { TaskFormType } from '../../model/schema/schema';

type TaskTzDescriptionProps = {
  isEdit: boolean;
  canEdit: boolean;
  description?: string;
  onEdit: () => void;
};

export const TaskTzDescription = ({
  isEdit,
  canEdit,
  description,
  onEdit,
}: TaskTzDescriptionProps) => {
  const { control } = useFormContext<TaskFormType>();
  const showDescription =
    isEdit || Boolean(description?.trim()) || canEdit;

  if (!showDescription) {
    return null;
  }

  return (
    <Box
      sx={{
        py: 2,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600 }}
        >
          Описание
        </Typography>
      </Stack>

      {isEdit ? (
        <RHFRichTextEditor
          control={control}
          name="description"
          maxLength={10000}
          minHeight={200}
        />
      ) : description?.trim() ? (
        <MarkdownContent content={description} />
      ) : (
        <Typography
          onClick={onEdit}
          sx={{
            color: 'info.main',
            fontWeight: 500,
            cursor: canEdit ? 'pointer' : 'default',
            ':hover': canEdit ? { color: 'primary.main' } : {},
          }}
        >
          {canEdit ? 'Добавить' : '—'}
        </Typography>
      )}
    </Box>
  );
};
