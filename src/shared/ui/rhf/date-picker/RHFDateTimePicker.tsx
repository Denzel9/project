import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { BASE_COLOR } from '@/app/index';

type RHFDateTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  label: string;
  width?: number | string;
  control: Control<TFieldValues>;
  size?: 'small' | 'medium';
};

export const RHFDateTimePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  control,
  width = '100%',
  size = 'medium',
}: RHFDateTimePickerProps<TFieldValues, TName>) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DateTimePicker
          label={label}
          value={field.value ? dayjs(field.value) : null}
          onChange={(value: Dayjs | null) =>
            field.onChange(value?.isValid() ? value.toISOString() : null)
          }
          slotProps={{
            textField: {
              size,
              fullWidth: true,
              error: Boolean(fieldState.error),
              helperText: fieldState.error?.message,
            },
          }}
          sx={{
            width,
            '& .MuiPickersOutlinedInput-root': {
              borderRadius: size === 'small' ? '12px' : '16px',
              '&:hover .MuiPickersOutlinedInput-notchedOutline': {
                borderColor: BASE_COLOR,
              },
              '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                borderColor: BASE_COLOR,
                borderWidth: '2px',
              },
            },
            '& .MuiDatePicker-inputLabel.Mui-focused': {
              color: BASE_COLOR,
            },
          }}
        />
      )}
    />
  </LocalizationProvider>
);
