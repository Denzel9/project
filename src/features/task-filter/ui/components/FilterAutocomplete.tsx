import { Autocomplete, TextField, type SxProps, type Theme } from '@mui/material';

export type FilterAutocompleteOption = {
  id: string;
  label: string;
};

type FilterAutocompleteProps = {
  label: string;
  value: string;
  options: FilterAutocompleteOption[];
  loading?: boolean;
  onChange: (id: string) => void;
  sx?: SxProps<Theme>;
};

export const FilterAutocomplete = ({
  label,
  value,
  options,
  loading = false,
  onChange,
  sx,
}: FilterAutocompleteProps) => {
  const selected =
    value === 'all' ? null : (options.find(option => option.id === value) ?? null);

  return (
    <Autocomplete
      size="small"
      fullWidth
      options={options}
      loading={loading}
      value={selected}
      onChange={(_, option) => onChange(option?.id ?? 'all')}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      clearOnEscape
      sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      renderInput={params => (
        <TextField
          {...params}
          fullWidth
          size="small"
          label={label}
          placeholder="Все"
        />
      )}
    />
  );
};
