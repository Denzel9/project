import { Close } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';

type TaskAlertBannerProps = {
  message: string;
  onClose: () => void;
};

export const TaskAlertBanner = ({ message, onClose }: TaskAlertBannerProps) => (
  <Box
    sx={{
      mb: 2,
      bgcolor: 'error.light',
      p: { xs: 2, md: 3 },
      borderRadius: '24px',
      border: '1px solid',
      borderColor: 'error.main',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
    }}
  >
    <Typography
      variant="h6"
      sx={{ fontWeight: 500, color: 'white' }}
    >
      {message}
    </Typography>

    <IconButton
      size="small"
      aria-label="Скрыть"
      onClick={onClose}
      sx={{
        color: 'white',
        flexShrink: 0,
        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
      }}
    >
      <Close fontSize="small" />
    </IconButton>
  </Box>
);
