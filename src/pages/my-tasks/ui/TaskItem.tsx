import { Whatshot } from '@mui/icons-material';
import { Avatar, Box, Checkbox, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router';

import { isTaskOverdue, TaskRequestStatusIcons, type Task } from '@/entities';
import {
  executorToUserPartial,
  getUserName,
  UserDisplayName,
  type User,
} from '@/entities/user';
import { getTaskConfig } from '@/features';
import { NSTooltip } from '@/shared';

import { getTaskPath } from '../model/utils/utils';

import { TaskActionsMenu } from './TaskActionsMenu';

type TaskItemProps = {
  task: Task;
  compact?: boolean;
  isCompany: boolean;
  groupByPost?: boolean;
  multipleTasks?: number;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (task: Task) => void;
};

const getContact = (task: Task, isCompany: boolean) => {
  if (isCompany) {
    const user = executorToUserPartial(task.executor ?? undefined);

    return {
      user,
      name: getUserName(user) || 'Исполнитель не назначен',
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

export const TaskItem = ({
  task,
  isCompany,
  compact = false,
  multipleTasks = 0,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  groupByPost = false,
}: TaskItemProps) => {
  const taskConfig = getTaskConfig(task.status);
  const accentColor = taskConfig?.color ?? 'primary';
  const contact = getContact(task, isCompany);
  const overdue = isTaskOverdue(task);

  const isMultiGroupByPost = groupByPost && multipleTasks > 0;


  if (compact) {
    return (
      <Box sx={{
        height: '100%',
        bgcolor: isMultiGroupByPost ? 'grey.500' : 'transparent',
        borderRadius: '24px',
      }}>
        <Box sx={{
          bgcolor: isMultiGroupByPost ? 'grey.400' : 'transparent',
          borderRadius: '24px',
          width: isMultiGroupByPost ? 'calc(100% - 2px)' : 'calc(100% + 2px)',
          height: isMultiGroupByPost ? 'calc(100% - 2px)' : 'calc(100% + 2px)',
        }}>
          <Box
            component={Link}
            to={getTaskPath(task)}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              p: 1.25,
              width: isMultiGroupByPost ? 'calc(100% - 2px)' : '100%',
              height: isMultiGroupByPost ? 'calc(100% - 2px)' : '100%',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
              borderRadius: '24px',
              textDecoration: 'none',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              ':hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Stack
              spacing={1}
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', minWidth: 0, flex: 1, flexWrap: 'wrap' }}
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={taskConfig?.label}
                  color={accentColor}
                  sx={{ height: 22, fontSize: '0.7rem', flexShrink: 0 }}
                />

                {task.urgent && (
                  <Whatshot sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />
                )}

                {groupByPost && multipleTasks > 0 &&
                  <NSTooltip
                    title="Количество связанных задач">
                    <Chip
                      label={`+${multipleTasks}`}
                      size="small"
                      variant="outlined"
                      color="primary" />
                  </NSTooltip>
                }

                <TaskRequestStatusIcons task={task} fontSize={16} spacing={0.5} />
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap', fontSize: '0.65rem', flexShrink: 0 }}
              >
                {formatDistanceToNow(new Date(task.updatedAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </Typography>
            </Stack>

            <Stack
              direction="column"
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {(task.post?.title?.length || 0) > 40 ? task.post?.title?.slice(0, 40) + '...' : task.post?.title || 'Без названия'}
              </Typography>

              <Tooltip title={task.title}>
                <Typography
                  variant="body2"
                >
                  {(task.title?.length || 0) > 50 ? task.title?.slice(0, 50) + '...' : task.title || 'Без названия'}
                </Typography>
              </Tooltip>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 1,
                minWidth: 0,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', minWidth: 0 }}
              >
                <Avatar
                  src={contact.avatar || undefined}
                  sx={{ width: 24, height: 24, flexShrink: 0 }}
                />
                <UserDisplayName
                  variant="body2"
                  withBadges={false}
                  user={contact.user}
                  sx={{
                    overflow: 'hidden',
                    '& .MuiTypography-root': {
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }}
                />
              </Stack>

              {task.finalDate && (
                <Tooltip title={overdue ? 'Просрочено' : 'Дедлайн'}>
                  <Chip
                    size="small"
                    label={format(new Date(task.finalDate), 'dd.MM.yy')}
                    color={overdue ? 'error' : 'default'}
                    variant={overdue ? 'filled' : 'outlined'}
                    sx={{ height: 22, fontSize: '0.7rem', opacity: 0.85 }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  }


  const cardSx = {
    p: 2,
    position: 'relative' as const,
    width: isMultiGroupByPost ? 'calc(100% - 2px)' : '100%',
    height: isMultiGroupByPost ? 'calc(100% - 2px)' : '100%',
    color: 'inherit',
    display: 'flex',
    bgcolor: 'background.paper',
    flexDirection: 'column' as const,
    borderRadius: '24px',
    textDecoration: 'none',
    border: '1px solid',
    borderColor: 'divider',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    cursor: isSelectionMode ? 'pointer' : undefined,
    ...(isSelected && {
      borderColor: 'primary.main',
      boxShadow: '0 0 0 1px var(--mui-palette-primary-main)',
    }),
    ':hover': {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-2px)',
    },
  };

  const handleCardClick = (event: React.MouseEvent) => {
    if (!isSelectionMode) return;

    event.preventDefault();
    onToggleSelection?.(task);
  };

  return (
    <Box sx={{
      height: '100%',
      bgcolor: isMultiGroupByPost ? 'grey.500' : 'transparent',
      borderRadius: '24px',
    }}>
      <Box sx={{
        bgcolor: isMultiGroupByPost ? 'grey.400' : 'transparent',
        borderRadius: '24px',
        width: isMultiGroupByPost ? 'calc(100% - 2px)' : 'calc(100% + 2px)',
        height: isMultiGroupByPost ? 'calc(100% - 2px)' : 'calc(100% + 2px)',
      }}>
        <Box
          component={isSelectionMode ? 'div' : Link}
          to={isSelectionMode ? undefined : getTaskPath(task)}
          target={isSelectionMode ? undefined : '_blank'}
          rel={isSelectionMode ? undefined : 'noopener noreferrer'}
          onClick={handleCardClick}
          sx={cardSx}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              mb: 1.5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
            >
              <Chip
                size="small"
                variant="outlined"
                label={taskConfig?.label}
                color={accentColor}
              />

              {task.urgent && <Whatshot color="error" sx={{ fontSize: 20 }} />}

              <TaskRequestStatusIcons task={task} />

              {multipleTasks > 0 && <NSTooltip title="Количество связанных задач">
                <Chip label={`+${multipleTasks}`} size="small" variant="outlined" color="primary" />
              </NSTooltip>}
            </Stack>

            <Stack
              spacing={0.5}
              direction="row"
              sx={{ alignItems: 'center' }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap' }}
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
                {!isSelectionMode && (
                  <TaskActionsMenu
                    task={task}
                    size="small"
                  />
                )}

                {isSelectionMode && (
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => onToggleSelection?.(task)}
                    onMouseDown={event => event.stopPropagation()}
                  />
                )}
              </Box>
            </Stack>
          </Stack>

          <Typography
            variant="subtitle1"
            sx={{
              mb: 0.5,
              fontWeight: 600,
              overflow: 'hidden',
              WebkitLineClamp: 2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.post?.title || 'Без названия'}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              width: 'fit-content',
            }}
          >
            {task.title || 'Без названия'}
          </Typography>

          <Stack
            direction="row"
            sx={{
              mt: 'auto',
              pt: 2,
              minWidth: 0,
              alignItems: 'end',
              justifyContent: 'space-between',
            }}
          >
            <Stack
              spacing={1}
              direction="row"
              sx={{ alignItems: 'center' }}
            >
              <Avatar
                src={contact.avatar || undefined}
                sx={{ width: 32, height: 32 }}
              />

              <UserDisplayName
                variant="body2"
                withBadges={false}
                user={contact.user}
              />
            </Stack>

            {task.finalDate && (
              <Tooltip title={overdue ? 'Просрочено' : 'Дедлайн'}>
                <Chip
                  size="small"
                  variant={'outlined'}
                  color={overdue ? 'error' : 'default'}
                  label={`Дедлайн: ${format(new Date(task.finalDate), 'dd.MM.yyyy')}`}
                />
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
