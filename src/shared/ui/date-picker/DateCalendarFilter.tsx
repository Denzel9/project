import { Button } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { type Dayjs } from 'dayjs';

import { DatePickerProvider } from '@/widgets';

type DateCalendarFilterProps = {
  value: string | null;
  onChange: (date: Dayjs | null) => void;
  onClear: () => void;
};

export const DateCalendarFilter = ({
  value,
  onChange,
  onClear,
}: DateCalendarFilterProps) => (
  <DatePickerProvider>
    <DateCalendar
      value={value ? dayjs(value) : null}
      onChange={onChange}
      views={['year', 'month', 'day']}
    />
    {value && (
      <Button
        fullWidth
        onClick={onClear}
        sx={{ mb: 2, mx: 2, width: 'calc(100% - 32px)' }}
      >
        Все даты
      </Button>
    )}
  </DatePickerProvider>
);
