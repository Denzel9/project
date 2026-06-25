import { Chip, Box, Stack, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type MultiSelectChipsProps<T extends string> = {
  name: string;
  label: string;
  options: { value: T; label: string }[];
};

export const MultiSelectChips = <T extends string>({
  name,
  label,
  options,
}: MultiSelectChipsProps<T>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected = (field.value ?? []) as T[];

        const toggle = (value: T) => {
          if (selected.includes(value)) {
            field.onChange(selected.filter(item => item !== value));
            return;
          }

          field.onChange([...selected, value]);
        };

        return (
          <Stack spacing={1}>
            <Typography
              variant="subtitle2"
              color={fieldState.error ? 'error' : 'text.primary'}
            >
              {label}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {options.map(option => (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  color={
                    selected.includes(option.value) ? 'primary' : 'default'
                  }
                  onClick={() => toggle(option.value)}
                />
              ))}
            </Box>

            {fieldState.error?.message && (
              <Typography
                variant="caption"
                color="error"
              >
                {fieldState.error.message}
              </Typography>
            )}
          </Stack>
        );
      }}
    />
  );
};
