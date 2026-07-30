import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

import { BASE_COLOR } from '@/app/index';

type DatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const DatePicker = ({ label, value, onChange }: DatePickerProps) => (
  <MuiDatePicker
    label={label}
    value={value ? dayjs(value) : null}
    onChange={(date: Dayjs | null) =>
      onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')
    }
    slotProps={{
      textField: {
        size: 'small',
        fullWidth: true,
      },
      desktopPaper: {
        sx: {
          borderRadius: '32px',
        },
      },
    }}
    sx={{
      width: '100%',
      '& .MuiPickersOutlinedInput-root': {
        borderRadius: '16px',
        '&:hover .MuiPickersOutlinedInput-notchedOutline': {
          borderColor: BASE_COLOR,
        },
        '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
          borderColor: BASE_COLOR,
          borderWidth: '2px',
        },
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: BASE_COLOR,
      },
    }}
  />
);
