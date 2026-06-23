import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ruRU } from '@mui/x-date-pickers/locales';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import updateLocale from 'dayjs/plugin/updateLocale';

import type { ReactNode } from 'react';

dayjs.extend(updateLocale);
dayjs.updateLocale('ru', { weekStart: 1 });

type DatePickerProviderProps = {
  children: ReactNode;
};

export const DatePickerProvider = ({ children }: DatePickerProviderProps) => (
  <LocalizationProvider
    dateAdapter={AdapterDayjs}
    adapterLocale="ru"
    localeText={
      ruRU.components.MuiLocalizationProvider.defaultProps.localeText
    }
  >
    {children}
  </LocalizationProvider>
);
