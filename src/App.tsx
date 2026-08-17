import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './app/providers/AuthProvider';
import { NotificationsProvider } from './app/providers/NotificationsProvider';
import { ThemeModeProvider } from './app/providers/ThemeModeProvider';
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
      <ThemeModeProvider>
        <DatePickerProvider>
          <AuthProvider>
            <NotificationsProvider>
              <Router />
              <SnackbarLocal />
              <CookieConsentBanner />
            </NotificationsProvider>
          </AuthProvider>
        </DatePickerProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

export default App;
