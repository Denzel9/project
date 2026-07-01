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

import {
  APPLICATION_STATUS_LABELS,
  getApplicantName,
  type PartnerApplicantItem,
} from '@/entities';
import { ROUTES } from '@/shared';

import { formatDateTime, formatRelativeTime } from '../model/utils';

import { partnersTableShellSx } from './PartnersTableSkeleton';

type ApplicantsTableProps = {
  items: PartnerApplicantItem[];
  emptyMessage: string;
};

const getStatusColor = (status: PartnerApplicantItem['status']) => {
  if (status === 'ACCEPTED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'VIEWED') return 'info';
  if (status === 'WITHDRAWN') return 'default';
  return 'primary';
};

export const ApplicantsTable = ({
  items,
  emptyMessage,
}: ApplicantsTableProps) => {
  const navigate = useNavigate();

  if (!items.length) {
    return <PartnersEmpty message={emptyMessage} />;
  }

  return (
    <TableContainer sx={partnersTableShellSx}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Кандидат</TableCell>
            <TableCell>Объявление</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Получен</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map(item => {
            const applicantName = getApplicantName(item.applicant);

            return (
              <TableRow
                key={item.id}
                hover
                onClick={() =>
                  item.applicant?.id &&
                  navigate(`${ROUTES.PROFILE}?userId=${item.applicant.id}`)
                }
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
                      src={item.applicant?.avatar ?? undefined}
                      sx={{ width: 36, height: 36 }}
                    >
                      {applicantName.charAt(0)}
                    </Avatar>

                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {applicantName}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.postTitle ?? 'Объявление'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={APPLICATION_STATUS_LABELS[item.status]}
                  />
                </TableCell>

                <TableCell>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {formatDateTime(item.createdAt)}
                    {item.createdAt !== item.updatedAt &&
                      ` · ${formatRelativeTime(item.updatedAt)}`}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
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
