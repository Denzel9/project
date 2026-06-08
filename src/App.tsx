import { ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './app/providers/AuthProvider';
import { theme } from './app/theme/theme';
import { Router } from './pages';
import { queryClient } from './shared/api';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
