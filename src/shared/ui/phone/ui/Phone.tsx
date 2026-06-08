import { Close } from '@mui/icons-material';
import {
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  type TextFieldProps,
} from '@mui/material';
import { useMask } from '@react-input/mask';
import { useMemo, type ChangeEvent } from 'react';

import { CHAR, MASK, OPERATORS } from '../lib/constants';

type PhoneInputProps = {
  value: string;
  label: string;
  isError?: boolean;
  onChange: (e: ChangeEvent) => void;
} & TextFieldProps;

export const PhoneInput = ({
  onChange,
  value,
  label,
  isError,
  ...props
}: PhoneInputProps) => {
  const inputRef = useMask({
    mask: MASK,
    replacement: CHAR,
    showMask: true,
  });

  const validatePhone = (
    phone: string
  ): { isValid: boolean; message: string } => {
    const cleanPhone = '7' + phone?.replace(/\D/g, '');

    if (cleanPhone.length === 11) {
      const operatorCode = cleanPhone.slice(1, 4);

      if (!OPERATORS.includes(operatorCode)) {
        return { isValid: false, message: 'Неверный код оператора' };
      }

      if (/(\d)\1{10}/.test(cleanPhone)) {
        return {
          isValid: false,
          message: 'Номер не может состоять из одинаковых цифр',
        };
      }
    }

    return {
      isValid: true,
      message: '',
    };
  };

  const handleOnBlurClearValue = () => {
    if (!value.replace(/\D/g, '')?.length)
      onChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
  };

  const handleClearValue = () => {
    onChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (/[^\d_\s]/g.test(e.target.value)) {
      return;
    }

    onChange(e);
  };

  const maskedValue = useMemo(() => {
    if (value?.startsWith('+7')) {
      return value?.slice(3);
    }
    return value;
  }, [value]);

  return (
    <TextField
      {...props}
      type="tel"
      fullWidth
      label={label}
      value={maskedValue}
      inputRef={inputRef}
      onBlur={handleOnBlurClearValue}
      helperText={validatePhone(value).message || ''}
      error={!validatePhone(value).isValid || isError}
      onChange={handleChange}
      placeholder="999 999 99 99"
      sx={{
        '& .MuiInputBase-input::placeholder': {
          opacity: 1,
          fontSize: '16px',
          color: theme => theme.palette.info.main,
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Typography color={value?.length ? 'primary' : 'info'}>
                +7
              </Typography>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="start">
              {Boolean(value?.length) && (
                <IconButton onClick={handleClearValue}>
                  <Close />
                </IconButton>
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
