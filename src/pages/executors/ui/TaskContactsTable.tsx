import {
  Avatar,
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
    <TableContainer
      className="partners-print-table"
      sx={partnersTableShellSx}
    >
      <Table sx={{ '& .MuiTableCell-root': { p: 3 } }}>
        <TableHead>
          <TableRow>
            <TableCell>{contactColumnLabel}</TableCell>
            <TableCell>Взаимодействий</TableCell>
            <TableCell>Последнее</TableCell>
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
                    className="partners-no-print"
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
                <Typography variant="body2">{item.interactionsCount}</Typography>
              </TableCell>

              <TableCell>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {formatRelativeTime(item.lastInteractionAt)}
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
