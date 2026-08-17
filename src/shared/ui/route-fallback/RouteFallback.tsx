import { Box, CircularProgress } from '@mui/material';

export const RouteFallback = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      width: '100%',
    }}
  >
    <CircularProgress size={32} />
  </Box>
);

export default RouteFallback;
