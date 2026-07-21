import { BusinessOutlined } from '@mui/icons-material';
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

import { UserDisplayName } from '@/entities/user';
import { ROUTES } from '@/shared';

import { formatRelativeTime } from '../model/utils';

import { partnersTableShellSx } from './PartnersTableSkeleton';

import type { ApplicationCompanyRow } from '../model/types';

type ApplicationCompaniesTableProps = {
  items: ApplicationCompanyRow[];
  emptyMessage: string;
};

export const ApplicationCompaniesTable = ({
  items,
  emptyMessage,
}: ApplicationCompaniesTableProps) => {
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
            <TableCell>Компания</TableCell>
            <TableCell>Откликов</TableCell>
            <TableCell>Объявлений</TableCell>
            <TableCell>Последний отклик</TableCell>
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

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <UserDisplayName user={item} />

                    <Chip
                      className="partners-no-print"
                      size="small"
                      variant="outlined"
                      icon={<BusinessOutlined />}
                      label="Компания"
                    />
                  </Stack>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {item.applicationsCount}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">{item.postsCount}</Typography>
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
