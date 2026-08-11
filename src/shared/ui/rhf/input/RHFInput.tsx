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
  /** Преобразует значение при вводе (например, форматирование суммы). */
  formatValue?: (value: string) => string;
};

const restoreDigitCaret = (
  input: HTMLInputElement | HTMLTextAreaElement,
  formatted: string,
  digitsBeforeCaret: number,
) => {
  let pos = 0;
  let seen = 0;

  while (pos < formatted.length && seen < digitsBeforeCaret) {
    if (/\d/.test(formatted.charAt(pos))) {
      seen += 1;
    }
    pos += 1;
  }

  try {
    input.setSelectionRange(pos, pos);
  } catch {
    // ignore unsupported input types
  }
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
  formatValue,
  autoCapitalize = 'on',
}: RHFInputProps<TFieldValues, TName>) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: { onChange: (value: string) => void }
  ) => {
    const input = e.target;
    const rawValue = input.value;
    const caret = input.selectionStart ?? rawValue.length;
    const digitsBeforeCaret = rawValue
      .slice(0, caret)
      .replace(/\D/g, '').length;

    const nextValue = formatValue ? formatValue(rawValue) : rawValue;

    if (regex && !regex.test(nextValue)) {
      return;
    }

    field.onChange(nextValue);

    if (formatValue) {
      requestAnimationFrame(() => {
        restoreDigitCaret(input, nextValue, digitsBeforeCaret);
      });
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const { slotProps: propsSlotProps, ...restProps } = props;
        const propsInputSlot =
          propsSlotProps &&
          typeof propsSlotProps === 'object' &&
          'input' in propsSlotProps
            ? propsSlotProps.input
            : undefined;

        return (
          <TextField
            {...field}
            {...restProps}
            value={field.value ?? ''}
            autoCapitalize={autoCapitalize}
            slotProps={{
              ...propsSlotProps,
              input: {
                ...(typeof propsInputSlot === 'object' && propsInputSlot
                  ? propsInputSlot
                  : {}),
                startAdornment: startAdornment ? (
                  <InputAdornment position="start">
                    {startAdornment}
                  </InputAdornment>
                ) : undefined,
                endAdornment: endAdornment ? (
                  <InputAdornment position="end">{endAdornment}</InputAdornment>
                ) : maxLength ? (
                  <InputAdornment position="end">
                    {maxLength - (String(field.value ?? '').length || 0)}
                  </InputAdornment>
                ) : undefined,
              },
            }}
            children={children}
            error={Boolean(fieldState.error)}
            onChange={e => handleChange(e, field)}
            disabled={field?.disabled || props?.disabled}
            helperText={fieldState.error?.message || props?.helperText}
            sx={{
              pointerEvents: props?.disabled ? 'none' : 'auto',
              ...props?.sx,
            }}
          />
        );
      }}
    />
  );
};
