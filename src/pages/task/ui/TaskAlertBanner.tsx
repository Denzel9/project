import { Close } from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material';

type TaskAlertBannerProps = {
  message: string;
  details?: string[];
  onClose: () => void;
  action?: React.ReactNode;
};

export const TaskAlertBanner = ({
  message,
  details,
  onClose,
  action,
}: TaskAlertBannerProps) => (
  <Stack
    direction="row"
    sx={{
      mb: 1,
      gap: 2,
      p: { xs: 2, md: 2 },
      border: '1px solid',
      borderRadius: '24px',
      alignItems: 'center',
      bgcolor: 'error.light',
      borderColor: 'error.main',
      justifyContent: 'space-between',
    }}
  >
    <Stack spacing={1}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 500, color: 'white' }}
      >
        {message}
      </Typography>

      {details?.map(detail => (
        <Typography
          key={detail}
          variant="body2"
          sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
        >
          {detail}
        </Typography>
      ))}
    </Stack>

    <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
      {action}

      <IconButton
        aria-label="Скрыть"
        onClick={onClose}
        sx={{
          color: 'white',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
        }}
      >
        <Close />
      </IconButton>
    </Stack>
  </Stack>
);
