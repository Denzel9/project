import { Snackbar } from '@mui/material';

import { useSnackbarStore } from '../model/store';

export const SnackbarLocal = () => {
  const { snackbarOpen, message, setSnackbarOpen } = useSnackbarStore();

  return (
    <Snackbar
      message={message}
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={() => setSnackbarOpen?.(false, '')}
    />
  );
};
