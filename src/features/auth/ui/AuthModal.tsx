import { Close } from '@mui/icons-material';
import { Box, Dialog, IconButton, Typography } from '@mui/material';

import { useAuthStore } from '../model/store/store';

import LoginForm from './LoginForm';

export const AuthModal = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useAuthStore();

  return (
    <Dialog
      open={isAuthModalOpen}
      onClose={() => setAuthModalOpen(false)}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          minWidth: 400,
        },
      }}
    >
      <IconButton
        onClick={() => setAuthModalOpen(false)}
        color="primary"
        sx={{
          top: 0,
          right: -60,
          position: 'absolute',
          bgcolor: 'secondary.main',
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2 }}
        >
          LOGO
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 2, opacity: 0.7 }}
        >
          Лучший способ создавать и управлять своим контентом
        </Typography>

        <LoginForm onSuccess={() => setAuthModalOpen(false)} />
      </Box>
    </Dialog>
  );
};
