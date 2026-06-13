import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { BASE_COLOR } from '@/app/index';

type RHFDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  label: string;
  control: Control<TFieldValues>;
};

export const RHFDatePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  control,
}: RHFDatePickerProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          label={label}
          value={field.value ? dayjs(field.value) : null}
          onChange={(date: Dayjs | null) =>
            field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')
          }
          slotProps={{
            textField: {
              fullWidth: true,
              error: Boolean(fieldState.error),
              helperText: fieldState.error?.message,
            },
          }}
          sx={{
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
            '& .MuiDatePicker-inputLabel.Mui-focused': {
              color: BASE_COLOR,
            },
          }}
        />
      )}
    />
  );
};
