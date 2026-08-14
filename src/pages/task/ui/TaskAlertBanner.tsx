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
    direction={{ xs: "column", md: "row" }}
    sx={{
      mb: 1,
      gap: 2,
      p: { xs: 2, md: 2 },
      border: '1px solid',
      borderRadius: '24px',
      alignItems: { xs: 'start', md: 'center' },
      bgcolor: 'error.light',
      borderColor: 'error.main',
      justifyContent: 'space-between',
    }}
  >
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ width: '100%', alignItems: 'start', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, color: 'white' }}
        >
          {message}
        </Typography>

        <IconButton
          aria-label="Скрыть"
          onClick={onClose}
          sx={{
            color: 'white',
            display: { xs: 'block', md: 'none' },
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
          }}
        >
          <Close />
        </IconButton>
      </Stack>


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

    <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'flex-end', md: 'center' }, width: { xs: '100%', md: 'auto' } }}>
      {action}

      <IconButton
        aria-label="Скрыть"
        onClick={onClose}
        sx={{
          color: 'white',
          display: { xs: 'none', md: 'block' },
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
        }}
      >
        <Close />
      </IconButton>
    </Stack>
  </Stack >
);
