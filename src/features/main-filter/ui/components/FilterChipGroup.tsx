import { Box, Chip, Stack, Typography } from '@mui/material';

type FilterChipGroupProps<T extends string> = {
  label?: string;
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
      {label && (
        <Typography
          variant="body2"
          color='info'
        >
          {label}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map(option => (
          <Chip
            clickable
            size="small"
            key={option.value}
            label={option.label}
            color={value.includes(option.value) ? 'primary' : 'default'}
            variant="filled"
            onClick={() => toggle(option.value)}
          />
        ))}
      </Box>
    </Stack>
  );
};
