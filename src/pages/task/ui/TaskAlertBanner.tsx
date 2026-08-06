import { Close } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';

type TaskAlertBannerProps = {
  message: string;
  details?: string[];
  onClose: () => void;
};

export const TaskAlertBanner = ({
  message,
  details,
  onClose,
}: TaskAlertBannerProps) => (
  <Box
    sx={{
      mb: 2,
      bgcolor: 'error.light',
      p: { xs: 2, md: 3 },
      borderRadius: '24px',
      border: '1px solid',
      borderColor: 'error.main',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 2,
    }}
  >
    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
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

    <IconButton
      size="small"
      aria-label="Скрыть"
      onClick={onClose}
      sx={{
        color: 'white',
        flexShrink: 0,
        mt: -0.5,
        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
      }}
    >
      <Close fontSize="small" />
    </IconButton>
  </Box>
);
