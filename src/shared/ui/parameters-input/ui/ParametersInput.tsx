import { TextField, type TextFieldProps } from '@mui/material';
import { type ChangeEvent, type KeyboardEvent } from 'react';

import { formatParametersValue } from '@/entities/user';

import { PARAMETERS_PLACEHOLDER } from '../lib/constants';

type ParametersInputProps = {
  value: string;
  label: string;
  error?: boolean;
  helperText?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
} & TextFieldProps;

const ALLOWED_KEYS = new Set([
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  'Home',
  'End',
]);

export const ParametersInput = ({
  onChange,
  value,
  label,
  error,
  helperText,
  ...props
}: ParametersInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (ALLOWED_KEYS.has(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }

    if (!/^\d$/.test(e.key) && e.key !== '/') {
      e.preventDefault();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatParametersValue(e.target.value);

    onChange({
      ...e,
      target: { ...e.target, value: formatted },
    });
  };

  return (
    <TextField
      {...props}
      fullWidth
      label={label}
      value={value ?? ''}
      error={Boolean(error)}
      helperText={helperText ?? ''}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      placeholder={PARAMETERS_PLACEHOLDER}
      inputMode="numeric"
    />
  );
};
