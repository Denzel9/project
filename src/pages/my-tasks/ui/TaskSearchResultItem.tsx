import { Box, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';

import { TASK_STATUS_LABELS, type Task } from '@/entities/task';
import { getUserName, type User } from '@/entities/user';

import { getKanbanColumnConfig } from '../model/kanbanColumns';

type TaskSearchResultItemProps = {
  task: Task;
  highlightQuery: string;
  onOpen: (taskId: string) => void;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedText = (text: string, highlight?: string) => {
  const trimmedHighlight = highlight?.trim();

  if (!trimmedHighlight) {
    return text;
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'gi')
  );

  return parts.map((part, index) =>
    part.toLowerCase() === trimmedHighlight.toLowerCase() ? (
      <Box
        key={`${part}-${index}`}
        component="mark"
        sx={{
          px: 0.25,
          color: 'inherit',
          borderRadius: 0.5,
          bgcolor: 'warning.light',
        }}
      >
        {part}
      </Box>
    ) : (
      part
    )
  );
};

export const TaskSearchResultItem = ({
  task,
  highlightQuery,
  onOpen,
}: TaskSearchResultItemProps) => {
  const statusColor = getKanbanColumnConfig(task.status)?.color ?? 'primary';

  return (
    <Box
      onClick={() => onOpen(task.id)}
      sx={{
        p: 2,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        cursor: 'pointer',
        bgcolor: 'transparent',
        '&:hover': {
          bgcolor: 'secondary.main',
        },
      }}
    >
      <Stack
        direction="column"
        spacing={1}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600 }}
          >
            {renderHighlightedText(
              task.post?.title ?? 'Без названия',
              highlightQuery
            )}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {format(new Date(task.updatedAt), 'dd.MM.yyyy')}
          </Typography>
        </Stack>

        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 500 }}
          color="primary"
        >
          {getUserName(task.owner as Partial<User>)}
        </Typography>
      </Stack>

      <Chip
        size="small"
        label={TASK_STATUS_LABELS[task.status]}
        color={statusColor}
        variant="outlined"
        sx={{ alignSelf: 'flex-start' }}
      />
    </Box>
  );
};

export default TaskSearchResultItem;
