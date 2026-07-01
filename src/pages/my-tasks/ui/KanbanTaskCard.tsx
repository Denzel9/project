import { Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { format, formatDistanceToNow, isPast, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { useNavigate } from 'react-router';

import { getUserName, type User, type Task, type TaskStatus } from '@/entities';
import { getTaskConfig } from '@/features';
import { ROUTES, MarkdownContent } from '@/shared';
import { MediaPreview } from '@/widgets';

import { TaskActionsMenu } from './TaskActionsMenu';

export const KANBAN_TASK_DRAG_TYPE = 'KANBAN_TASK';

export type KanbanTaskDragItem = {
  taskId: string;
  status: TaskStatus;
};

type KanbanTaskCardProps = {
  task: Task;
  canDrag: boolean;
};

export const KanbanTaskCard = ({ task, canDrag }: KanbanTaskCardProps) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const columnConfig = getTaskConfig(task.status);
  const accentColor = columnConfig?.color ?? 'primary';

  const isOverdue =
    Boolean(task.finalDate) &&
    isPast(startOfDay(new Date(task.finalDate!))) &&
    task.status !== 'COMPLETED' &&
    task.status !== 'CANCELLED';

  const [{ isDragging }, drag] = useDrag({
    type: KANBAN_TASK_DRAG_TYPE,
    item: { taskId: task.id, status: task.status },
    canDrag,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // eslint-disable-next-line react-hooks/refs
  drag(ref);

  const handleClick = () => {
    if (isDragging) return;

    navigate(`${ROUTES.TASK}/${task.id}?taskId=${task.id}&inviteId=${task.id}`);
  };

  return (
    <Box
      ref={ref}
      onClick={handleClick}
      sx={{
        p: 2,
        bgcolor: 'white',
        borderRadius: '16px',
        cursor: canDrag ? 'grab' : 'pointer',
        border: theme => `1px solid ${theme.palette.secondary.main}`,
        borderLeft: theme => `4px solid ${theme.palette[accentColor].main}`,
        opacity: isDragging ? 0.85 : 1,
        transform: isDragging ? 'rotate(1deg)' : 'none',
        transition:
          'box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
        boxShadow: isDragging ? '0 12px 32px rgba(0, 0, 0, 0.15)' : 'none',
        ':hover': {
          transform: isDragging ? 'rotate(1deg)' : 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
      >
        {task.urgent ? (
          <Chip
            size="small"
            icon={<Whatshot />}
            label="Срочно"
            color="error"
            variant="outlined"
          />
        ) : (
          <Box />
        )}

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center' }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {formatDistanceToNow(new Date(task.updatedAt), {
              addSuffix: true,
              locale: ru,
            })}
          </Typography>

          <Box
            component="span"
            onClick={event => event.stopPropagation()}
            onMouseDown={event => event.stopPropagation()}
          >
            <TaskActionsMenu
              task={task}
              size="small"
            />
          </Box>
        </Stack>
      </Stack>

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {task.post?.title ?? 'Без названия'}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', minWidth: 0, mb: 2 }}
      >
        <Avatar
          src={task.owner?.avatar ?? ''}
          sx={{ width: 28, height: 28 }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getUserName(task.owner as Partial<User>)}
        </Typography>
      </Stack>

      {task.description && (
        <MarkdownContent
          content={task.description}
          sx={{
            mb: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        />
      )}

      {Boolean(task.media?.length) && (
        <Box sx={{ mb: 1.5 }}>
          <MediaPreview media={task.media.slice(0, 5)} />
        </Box>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1 }}
      >
        {task.finalDate && (
          <Chip
            size="small"
            label={format(new Date(task.finalDate), 'dd.MM.yyyy')}
            color={isOverdue ? 'error' : 'default'}
            variant={isOverdue ? 'filled' : 'outlined'}
            sx={{ flexShrink: 0, height: 24, fontSize: '0.7rem' }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default KanbanTaskCard;
