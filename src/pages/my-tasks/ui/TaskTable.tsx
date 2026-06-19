import { Whatshot } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow, isPast, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router';

import { TASK_STATUS_LABELS, type Task } from '@/entities/task';
import { getUserName, type User } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { MarkdownContent } from '@/shared/ui/markdown';
import { MediaPreview } from '@/widgets/media/ui/MediaPreview';

import { getKanbanColumnConfig } from '../model/kanbanColumns';

type TaskTableProps = {
  tasks: Task[];
};

const isTaskOverdue = (task: Task) =>
  Boolean(task.finalDate) &&
  isPast(startOfDay(new Date(task.finalDate!))) &&
  task.status !== 'COMPLETED' &&
  task.status !== 'CANCELLED';

export const TaskTable = ({ tasks }: TaskTableProps) => {
  const navigate = useNavigate();

  return (
    <TableContainer
      sx={{
        width: '100%',
        overflowX: 'auto',
        bgcolor: 'white',
        borderRadius: { xs: '16px', md: '32px' },
        border: theme => `1px solid ${theme.palette.secondary.main}`,
      }}
    >
      <Table sx={{ minWidth: 960 }}>
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Срочно</TableCell>
            <TableCell>Заказчик</TableCell>
            <TableCell sx={{ minWidth: 180 }}>Описание</TableCell>
            <TableCell>Медиа</TableCell>
            <TableCell>Обновлено</TableCell>
            <TableCell>Дедлайн</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {tasks.map(task => {
            const columnConfig = getKanbanColumnConfig(task.status);
            const statusColor = columnConfig?.color ?? 'primary';
            const overdue = isTaskOverdue(task);

            return (
              <TableRow
                key={task.id}
                hover
                onClick={() => navigate(`${ROUTES.TASK}/${task.id}`)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'secondary.light' },
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, minWidth: 140 }}
                  >
                    {task.post?.title ?? 'Без названия'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={TASK_STATUS_LABELS[task.status]}
                    color={statusColor}
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  {task.urgent ? (
                    <Chip
                      size="small"
                      icon={<Whatshot />}
                      label="Срочно"
                      color="error"
                      variant="outlined"
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', minWidth: 120 }}
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
                        maxWidth: 120,
                      }}
                    >
                      {getUserName(task.owner as Partial<User>)}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  {task.description ? (
                    <MarkdownContent
                      content={task.description}
                      sx={{
                        maxWidth: 220,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  {task.media?.length ? (
                    <Box sx={{ minWidth: 100 }}>
                      <MediaPreview media={task.media.slice(0, 5)} />
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
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
                </TableCell>

                <TableCell>
                  {task.finalDate ? (
                    <Chip
                      size="small"
                      label={format(new Date(task.finalDate), 'dd.MM.yyyy')}
                      color={overdue ? 'error' : 'default'}
                      variant={overdue ? 'filled' : 'outlined'}
                      sx={{ height: 24, fontSize: '0.7rem' }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;
