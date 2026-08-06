import { LockOutlined, Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { useNavigate } from 'react-router';

import {
  executorToUserPartial,
  getTaskStatusTransitionBlockReason,
  getUserName,
  UserDisplayName,
  isTaskOverdue,
  USER_ROLE,
  type Task,
  type TaskStatus,
  type User,
} from '@/entities';
import { getTaskConfig, useAuthStore } from '@/features';

import { getTaskPath } from '../model/utils/utils';

import { TaskActionsMenu } from './TaskActionsMenu';

export const KANBAN_TASK_DRAG_TYPE = 'KANBAN_TASK';

export type KanbanTaskDragItem = {
  taskId: string;
  status: TaskStatus;
  ownerId: string;
  executorId: string | null;
  isExecutorApprove: boolean | null;
  isCompanyAction: boolean;
};

type KanbanTaskCardProps = {
  task: Task;
  canDrag: boolean;
};

const getContact = (task: Task, isCompany: boolean) => {
  if (isCompany) {
    const user = executorToUserPartial(task.executor ?? undefined);

    return {
      user,
      name: getUserName(user) || 'Не назначен',
      avatar: task.executor?.avatar ?? '',
      label: 'Исполнитель',
    };
  }

  const user = task.owner as Partial<User>;

  return {
    user,
    name: getUserName(user) || 'Компания',
    avatar: task.owner?.avatar ?? '',
    label: 'Заказчик',
  };
};

export const KanbanTaskCard = ({ task, canDrag }: KanbanTaskCardProps) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { role, id: currentUserId } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;

  const columnConfig = getTaskConfig(task.status);
  const accentColor = columnConfig?.color ?? 'primary';
  const contact = getContact(task, isCompany);
  const overdue = isTaskOverdue(task);
  const dragBlockReason = canDrag
    ? null
    : getTaskStatusTransitionBlockReason(task, currentUserId ?? null);

  const [{ isDragging }, drag] = useDrag({
    type: KANBAN_TASK_DRAG_TYPE,
    item: {
      taskId: task.id,
      status: task.status,
      ownerId: task.ownerId,
      executorId: task.executorId,
      isExecutorApprove: task.isExecutorApprove,
      isCompanyAction: task.isCompanyAction,
    } satisfies KanbanTaskDragItem,
    canDrag,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // eslint-disable-next-line react-hooks/refs
  drag(ref);

  const handleClick = () => {
    if (isDragging) return;

    navigate(getTaskPath(task));
  };

  return (
    <Tooltip
      title={dragBlockReason ?? ''}
      disableHoverListener={!dragBlockReason}
      disableFocusListener={!dragBlockReason}
      disableTouchListener={!dragBlockReason}
      placement="top"
      enterDelay={400}
    >
      <Stack
        direction="column"
        ref={ref}
        onClick={handleClick}
        sx={{
          p: 2,
          justifyContent: 'space-between',
          minHeight: 140,
          overflow: 'hidden',
          bgcolor: 'white',
          borderRadius: '14px',
          border: '1px solid',
          borderColor: 'divider',
          borderLeftWidth: 2,
          borderLeftColor: theme => theme.palette[accentColor].main,
          cursor: canDrag
            ? isDragging
              ? 'grabbing'
              : 'grab'
            : 'not-allowed',
          opacity: isDragging ? 0.92 : canDrag ? 1 : 0.72,
          boxShadow: isDragging ? theme => theme.shadows[6] : 'none',
          transition:
            'box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
          '&:hover': {
            boxShadow: theme =>
              isDragging
                ? theme.shadows[6]
                : '0 4px 16px rgba(0, 0, 0, 0.06)',
            transform: isDragging || !canDrag ? 'none' : 'translateY(-1px)',
          },
        }}
      >
        <Stack
          spacing={1}
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack
            spacing={1}
            direction="row"
            sx={{ alignItems: 'center', minWidth: 0 }}
          >
            <Tooltip title={task.title}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.title && task.title.length > 25
                  ? task.title.slice(0, 25) + '...'
                  : task.title || 'Без названия'}
              </Typography>
            </Tooltip>

            {task.urgent && (
              <Whatshot sx={{ fontSize: 18, color: 'error.main' }} />
            )}

            {dragBlockReason && (
              <LockOutlined
                sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }}
              />
            )}
          </Stack>

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

      <Stack
        direction="row"
        spacing={0.25}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography
          variant="caption"
          sx={{
            lineHeight: 1.35,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: task.title ? 0.25 : 0,
          }}
        >
          {task.post?.title ?? 'Без названия'}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap', fontSize: '0.7rem' }}
        >
          {formatDistanceToNow(new Date(task.updatedAt), {
            addSuffix: true,
            locale: ru,
          })}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 1.5,
          minWidth: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Avatar
            src={contact.avatar || undefined}
            sx={{ width: 26, height: 26, flexShrink: 0 }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                lineHeight: 1.2,
                fontSize: '0.65rem',
              }}
            >
              {contact.label}
            </Typography>

            <UserDisplayName
              variant="body2"
              withBadges={false}
              user={contact.user}
            />
          </Box>
        </Stack>

        {task.finalDate && (
          <Tooltip title={overdue ? 'Дедлайн просрочен' : 'Дедлайн'}>
            <Chip
              size="small"
              label={format(new Date(task.finalDate), 'dd.MM.yy')}
              color={overdue ? 'error' : 'default'}
              variant={overdue ? 'filled' : 'outlined'}
              sx={{
                opacity: 0.75,
              }}
            />
          </Tooltip>
        )}
      </Stack>
      </Stack>
    </Tooltip>
  );
};

export default KanbanTaskCard;
