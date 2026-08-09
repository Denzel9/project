import { Box, Button, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import {
  TASK_REQUEST_INITIATOR_LABELS,
  type TaskAnnulmentInitiator,
} from '@/entities';

type TaskPendingRequestBannerProps = {
  title: string;
  initiator: TaskAnnulmentInitiator;
  reason?: string | null;
  proposedFinalDate?: string | null;
  canRespond: boolean;
  isConfirming?: boolean;
  isRejecting?: boolean;
  onConfirm: () => void;
  onReject: () => void;
};

export const TaskPendingRequestBanner = ({
  title,
  initiator,
  reason,
  proposedFinalDate,
  canRespond,
  isConfirming = false,
  isRejecting = false,
  onConfirm,
  onReject,
}: TaskPendingRequestBannerProps) => {
  const isBusy = isConfirming || isRejecting;
  const trimmedReason = reason?.trim();

  return (
    <Box
      sx={{
        mb: 2,
        bgcolor: 'info.light',
        p: { xs: 2, md: 3 },
        borderRadius: '24px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        Инициатор: {TASK_REQUEST_INITIATOR_LABELS[initiator]}
      </Typography>

      {proposedFinalDate && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Новая дата:{' '}
          {format(new Date(proposedFinalDate), 'dd.MM.yyyy', { locale: ru })}
        </Typography>
      )}

      {trimmedReason && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Причина: {trimmedReason}
        </Typography>
      )}

      {canRespond && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="outlined" disabled={isBusy} onClick={onReject}>
            Отклонить
          </Button>
          <Button
            variant="contained"
            color="primary"
            loading={isConfirming}
            disabled={isBusy}
            onClick={onConfirm}
          >
            Подтвердить
          </Button>
        </Stack>
      )}
    </Box>
  );
};
