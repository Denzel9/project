import { Add } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { useState, type KeyboardEvent } from 'react';

type FilterTagsInputProps = {
  size?: 'small' | 'medium';
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export const FilterTagsInput = ({
  size = 'small',
  label,
  value,
  onChange,
  placeholder,
}: FilterTagsInputProps) => {
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const next = raw.trim();

    if (!next || value.includes(next)) return;

    onChange([...value, next]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(item => item !== tag));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag(input);
    }
  };

  return (
    <Stack spacing={1}>
      <TextField
        size={size}
        fullWidth
        value={input}
        label={label}
        placeholder={placeholder}
        onChange={event => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) addTag(input);
        }}
        slotProps={{
          input: {
            endAdornment: input.trim() ? (
              <InputAdornment position="end">
                <IconButton onClick={() => addTag(input)}>
                  <Add />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {Boolean(value.length) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {value.map(tag => (
            <Chip
              key={tag}
              size="small"
              label={tag}
              onDelete={() => removeTag(tag)}
            />
          ))}
        </Box>
      )}
    </Stack>
  );
};
