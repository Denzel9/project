import { InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { type ReactNode } from 'react';
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type RHFInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  regex?: RegExp;
  maxLength?: number;
  children?: ReactNode;
  props: TextFieldProps;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
  autoCapitalize?: 'off' | 'on';
  control: Control<TFieldValues>;
};

export const RHFInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  props,
  regex,
  control,
  maxLength,
  children,
  endAdornment,
  startAdornment,
  autoCapitalize = 'on',
}: RHFInputProps<TFieldValues, TName>) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: FieldValues
  ) => {
    if (regex && !regex.test(e.target.value)) {
      return;
    }
    field.onChange(e);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          autoCapitalize={autoCapitalize}
          slotProps={{
            input: {
              startAdornment: startAdornment && (
                <InputAdornment position="start">
                  {startAdornment}
                </InputAdornment>
              ),

              endAdornment:
                endAdornment ||
                (maxLength && (
                  <InputAdornment position="start">
                    {endAdornment || maxLength - (field?.value?.length || 0)}
                  </InputAdornment>
                )),
            },
          }}
          children={children}
          error={Boolean(fieldState.error)}
          onChange={e => handleChange(e, field)}
          disabled={field.disabled || props.disabled}
          helperText={fieldState.error?.message || props.helperText}
          sx={{ pointerEvents: props?.disabled ? 'none' : 'auto', ...props.sx }}
        />
      )}
    />
  );
};
