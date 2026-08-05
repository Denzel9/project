import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  type SxProps,
  type Theme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export type FilterAutocompleteOption = {
  id: string;
  label: string;
};

type FilterAutocompleteProps = {
  label?: string;
  value: string;
  options: FilterAutocompleteOption[];
  loading?: boolean;
  placeholder?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  onChange: (id: string) => void;
  sx?: SxProps<Theme>;
  selectedOption?: FilterAutocompleteOption | null;
  minInputLength?: number;
  onSearch?: (query: string) => void;
  searchDebounceMs?: number;
  size?: 'small' | 'medium';
};

export const FilterAutocomplete = ({
  label,
  value,
  options,
  loading = false,
  placeholder = 'Все',
  variant = 'outlined',
  onChange,
  sx,
  selectedOption = null,
  minInputLength,
  onSearch,
  searchDebounceMs = 300,
  size = 'medium',
}: FilterAutocompleteProps) => {
  const isServerSearch = minInputLength !== undefined && minInputLength > 0;

  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const onSearchRef = useRef(onSearch);
  // eslint-disable-next-line react-hooks/refs
  onSearchRef.current = onSearch;

  const selected =
    value === 'all'
      ? null
      : (options.find(option => option.id === value) ?? selectedOption);

  const trimmedInput = searchInput.trim();
  const canSearch =
    isServerSearch && trimmedInput.length >= (minInputLength as number);

  const displayOptions = isServerSearch && !canSearch ? [] : options;
  const isSearching = canSearch && (isDebouncing || loading);

  const inputValue = isServerSearch
    ? open
      ? searchInput
      : (selected?.label ?? '')
    : undefined;

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setIsDebouncing(false);
      }, 0);
    }
  }, [loading]);

  useEffect(() => {
    if (!isServerSearch) return;

    const trimmed = searchInput.trim();
    if (trimmed.length < minInputLength) {
      setTimeout(() => {
        setIsDebouncing(false);
      }, 0);
      const timer = window.setTimeout(() => {
        onSearchRef.current?.('');
      }, searchDebounceMs);

      return () => window.clearTimeout(timer);
    }

    setTimeout(() => {
      setIsDebouncing(true);
    }, 0);
    const timer = window.setTimeout(() => {
      onSearchRef.current?.(trimmed);
      window.setTimeout(() => setIsDebouncing(false), 0);
    }, searchDebounceMs);

    return () => window.clearTimeout(timer);
  }, [isServerSearch, minInputLength, searchDebounceMs, searchInput]);

  return (
    <Autocomplete

      fullWidth
      open={isServerSearch ? open : undefined}
      onOpen={() => {
        if (!isServerSearch) return;
        setOpen(true);
        setSearchInput('');
        setIsDebouncing(false);
        onSearchRef.current?.('');
      }}
      onClose={() => {
        if (!isServerSearch) return;
        setOpen(false);
        setSearchInput('');
        setIsDebouncing(false);
      }}
      options={displayOptions}
      loading={isSearching}
      loadingText={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
          <CircularProgress size={22} />
        </Box>
      }
      value={selected}
      inputValue={inputValue}
      onInputChange={(_, next, reason) => {
        if (!isServerSearch) return;
        if (reason === 'input') {
          setSearchInput(next);
        }
        if (reason === 'clear') {
          setSearchInput('');
          setIsDebouncing(false);
          onSearchRef.current?.('');
        }
      }}
      onChange={(_, option) => onChange(option?.id ?? 'all')}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      filterOptions={isServerSearch ? opts => opts : undefined}
      clearOnEscape
      noOptionsText={
        isServerSearch
          ? canSearch
            ? 'Ничего не найдено'
            : `Введите минимум ${minInputLength} символа`
          : undefined
      }
      slotProps={{
        paper: {
          sx: { borderRadius: '32px' },
        },
      }}
      sx={[{ minWidth: 0, }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      renderInput={params => (
        <TextField
          {...params}
          size={size}
          fullWidth
          variant={variant}
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  );
};
