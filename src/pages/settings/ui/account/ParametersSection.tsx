import { InputAdornment, MenuItem } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { MY_PARAMETERS, MY_PARAMETERS_LABELS } from '@/entities/user';
import { RHFDatePicker, RHFInput, RHFParametersInput } from '@/shared/ui/rhf';

import { SIZE_OPTIONS, GENDER_OPTIONS } from '../../model/constants';

export const ParametersSection = () => {
  const { control } = useFormContext();
  return Object.entries(MY_PARAMETERS_LABELS).map(([key, value]) => {
    switch (key) {
      case MY_PARAMETERS.HEIGHT:
      case MY_PARAMETERS.WEIGHT:
        return (
          <RHFInput
            key={key}
            name={key}
            control={control}
            endAdornment={
              <InputAdornment position="end">
                {key === MY_PARAMETERS.HEIGHT ? 'см.' : 'кг.'}
              </InputAdornment>
            }
            props={{
              fullWidth: true,
              label: value,
            }}
          />
        );
      case MY_PARAMETERS.SIZE:
        return (
          <RHFInput
            key={key}
            name={key}
            control={control}
            props={{
              select: true,
              fullWidth: true,
              label: value,
            }}
          >
            {SIZE_OPTIONS.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </RHFInput>
        );
      case MY_PARAMETERS.BIRTHDAY:
        return (
          <RHFDatePicker
            key={key}
            name={key}
            control={control}
            label={value}
          />
        );
      case MY_PARAMETERS.GENDER:
        return (
          <RHFInput
            key={key}
            name={key}
            control={control}
            props={{
              select: true,
              fullWidth: true,
              label: value,
            }}
          >
            {GENDER_OPTIONS.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </RHFInput>
        );
      case MY_PARAMETERS.PARAMETERS:
        return (
          <RHFParametersInput
            key={key}
            name={key}
            control={control}
            label={value}
          />
        );
      default:
        return null;
    }
  });
};
