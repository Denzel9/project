import { ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './app/providers/AuthProvider';
import { NotificationsProvider } from './app/providers/NotificationsProvider';
import { theme } from './app/theme/theme';
import { Router } from './pages';
import { queryClient } from './shared';
import { SnackbarLocal } from './widgets';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <NotificationsProvider>
            <Router />
            <SnackbarLocal />
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
