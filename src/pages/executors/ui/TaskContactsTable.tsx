import { BusinessOutlined, PersonOutlined } from '@mui/icons-material';
import {
  Avatar,
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
import { useNavigate } from 'react-router';

import { ROUTES } from '@/shared';

import { formatRelativeTime } from '../model/utils';

import { partnersTableShellSx } from './PartnersTableSkeleton';

import type { TaskContactRow } from '../model/types';

type TaskContactsTableProps = {
  items: TaskContactRow[];
  contactColumnLabel: string;
  emptyMessage: string;
};

const KIND_LABELS = {
  CREATOR: 'Креатор',
  COMPANY: 'Компания',
} as const;

export const TaskContactsTable = ({
  items,
  contactColumnLabel,
  emptyMessage,
}: TaskContactsTableProps) => {
  const navigate = useNavigate();

  if (!items.length) {
    return <PartnersEmpty message={emptyMessage} />;
  }

  return (
    <TableContainer sx={partnersTableShellSx}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{contactColumnLabel}</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell>Задач</TableCell>
            <TableCell>В работе</TableCell>
            <TableCell>Активность</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map(item => (
            <TableRow
              key={item.id}
              hover
              onClick={() => navigate(`${ROUTES.PROFILE}?userId=${item.id}`)}
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'secondary.light' },
              }}
            >
              <TableCell>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', minWidth: 180 }}
                >
                  <Avatar
                    src={item.avatar || undefined}
                    sx={{ width: 36, height: 36 }}
                  >
                    {item.name.charAt(0)}
                  </Avatar>

                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600 }}
                  >
                    {item.name}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  icon={
                    item.kind === 'COMPANY' ? (
                      <BusinessOutlined />
                    ) : (
                      <PersonOutlined />
                    )
                  }
                  label={KIND_LABELS[item.kind]}
                />
              </TableCell>

              <TableCell>
                <Typography variant="body2">{item.tasksTotal}</Typography>
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  color={item.tasksActive > 0 ? 'primary' : 'default'}
                  variant={item.tasksActive > 0 ? 'filled' : 'outlined'}
                  label={item.tasksActive}
                />
              </TableCell>

              <TableCell>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {formatRelativeTime(item.lastActivityAt)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const PartnersEmpty = ({ message }: { message: string }) => (
  <Stack
    sx={{
      py: 8,
      px: 3,
      alignItems: 'center',
      textAlign: 'center',
      bgcolor: 'white',
      borderRadius: { xs: '16px', md: '32px' },
      border: theme => `1px solid ${theme.palette.divider}`,
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
    >
      {message}
    </Typography>
  </Stack>
);
