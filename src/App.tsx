import { ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './app/providers/AuthProvider';
import { NotificationsProvider } from './app/providers/NotificationsProvider';
import { theme } from './app/theme/theme';
import { Router } from './pages';
import { queryClient } from './shared';
import {
  CookieConsentBanner,
  DatePickerProvider,
  SnackbarLocal,
} from './widgets';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <DatePickerProvider>
          <AuthProvider>
            <NotificationsProvider>
              <Router />
              <SnackbarLocal />
              <CookieConsentBanner />
            </NotificationsProvider>
          </AuthProvider>
        </DatePickerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
