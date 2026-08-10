import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const showDescription =
    isEdit || Boolean(description?.trim()) || canEdit;

  useEffect(() => {
    if (isEdit) {
      setIsExpanded(true);
    }
  }, [isEdit]);

  if (!showDescription) {
    return null;
  }

  const handleToggle = () => {
    if (isEdit) return;
    setIsExpanded(prev => !prev);
  };

  return (
    <Box
      sx={{
        py: 2,
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        onClick={handleToggle}
        sx={{
          mb: isExpanded || isEdit ? 1 : 0,
          alignItems: 'center',
          cursor: isEdit ? 'default' : 'pointer',
          userSelect: 'none',
        }}
      >
        {!isEdit && (
          <IconButton
            size="small"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? 'Свернуть описание' : 'Развернуть описание'
            }
            onClick={event => {
              event.stopPropagation();
              handleToggle();
            }}
            sx={{ p: 0.25 }}
          >
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </IconButton>
        )}

        <Typography
          variant="subtitle2"
          color="info"
          sx={{ fontWeight: 600 }}
        >
          Описание
        </Typography>
      </Stack>

      <Collapse in={isEdit || isExpanded}>
        {isEdit ? (
          <RHFRichTextEditor
            control={control}
            name="description"
            maxLength={2500}
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
      </Collapse>
    </Box>
  );
};
