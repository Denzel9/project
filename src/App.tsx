import { ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ruRU } from '@mui/x-date-pickers/locales';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import updateLocale from 'dayjs/plugin/updateLocale';

import { AuthProvider } from './app/providers/AuthProvider';
import { theme } from './app/theme/theme';
import { Router } from './pages';
import { queryClient } from './shared/api';

dayjs.extend(updateLocale);
dayjs.updateLocale('ru', { weekStart: 1 });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ru"
        localeText={
          ruRU.components.MuiLocalizationProvider.defaultProps.localeText
        }
      >
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
