import { Box, Chip, Stack, Typography } from '@mui/material';

type FilterChipGroupProps<T extends string> = {
  label: string;
  value: T[];
  options: { value: T; label: string }[];
  onChange: (value: T[]) => void;
};

export const FilterChipGroup = <T extends string>({
  label,
  value,
  options,
  onChange,
}: FilterChipGroupProps<T>) => {
  const toggle = (option: T) => {
    if (value.includes(option)) {
      onChange(value.filter(item => item !== option));
      return;
    }

    onChange([...value, option]);
  };

  return (
    <Stack spacing={1}>
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {options.map(option => (
          <Chip
            key={option.value}
            size="small"
            label={option.label}
            clickable
            color={value.includes(option.value) ? 'primary' : 'default'}
            variant={value.includes(option.value) ? 'filled' : 'outlined'}
            onClick={() => toggle(option.value)}
          />
        ))}
      </Box>
    </Stack>
  );
};
