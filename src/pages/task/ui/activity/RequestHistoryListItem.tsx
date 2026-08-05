import { Box, Stack, Typography, alpha } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import type {
  TaskAnnulmentInitiator,
  TaskAnnulmentStatus,
} from '@/entities/task';

export type RequestHistoryItem = {
  id: string;
  kind: 'annulment' | 'deadline';
  status: TaskAnnulmentStatus;
  initiator: TaskAnnulmentInitiator;
  reason: string;
  requestedAt: string;
  proposedFinalDate?: string;
};

const STATUS_LABELS: Record<TaskAnnulmentStatus, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  REJECTED: 'Отклонён',
};

const INITIATOR_LABELS: Record<TaskAnnulmentInitiator, string> = {
  CUSTOMER: 'Заказчик',
  EXECUTOR: 'Исполнитель',
  MUTUAL: 'Договорённость сторон',
};

const STATUS_PALETTE: Record<
  TaskAnnulmentStatus,
  'warning' | 'success' | 'error'
> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'error',
};

type RequestHistoryListItemProps = {
  item: RequestHistoryItem;
  isLast?: boolean;
};

export const RequestHistoryListItem = ({
  item,
  isLast = false,
}: RequestHistoryListItemProps) => {
  const paletteKey = STATUS_PALETTE[item.status];
  const title =
    item.kind === 'annulment' ? 'Аннулирование' : 'Перенос дедлайна';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '28px 1fr',
        columnGap: 1.25,
        pb: isLast ? 0 : 2.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 0.35,
        }}
      >
        <Box
          sx={theme => ({
            width: 11,
            height: 11,
            borderRadius: '50%',
            bgcolor: `${paletteKey}.main`,
            boxShadow: `0 0 0 4px ${alpha(theme.palette[paletteKey].main, 0.14)}`,
            zIndex: 1,
          })}
        />
      </Box>

      <Box
        sx={theme => ({
          minWidth: 0,
          p: 1.75,
          borderRadius: '18px',
          bgcolor: alpha(theme.palette[paletteKey].main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette[paletteKey].main, 0.12),
        })}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' }}
          >
            {title}
          </Typography>

          <Typography
            variant="caption"
            sx={theme => ({
              flexShrink: 0,
              px: 1,
              py: 0.35,
              borderRadius: '8px',
              fontWeight: 600,
              lineHeight: 1.2,
              color: `${paletteKey}.dark`,
              bgcolor: alpha(theme.palette[paletteKey].main, 0.12),
            })}
          >
            {STATUS_LABELS[item.status]}
          </Typography>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.75 }}
        >
          {format(new Date(item.requestedAt), 'd MMM yyyy, HH:mm', {
            locale: ru,
          })}
          {' · '}
          Инициатор: {INITIATOR_LABELS[item.initiator]}
        </Typography>

        {item.proposedFinalDate && (
          <Typography
            variant="body2"
            sx={theme => ({
              mt: 1.25,
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.25,
              py: 0.5,
              borderRadius: '10px',
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              color: 'text.primary',
              fontWeight: 500,
              fontSize: '0.8125rem',
            })}
          >
            Новая дата ·{' '}
            {format(new Date(item.proposedFinalDate), 'd MMM yyyy', {
              locale: ru,
            })}
          </Typography>
        )}

        {item.reason && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1.25,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {item.reason}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
