import { Box, Chip, Stack, TextField } from '@mui/material';
import { useState, type KeyboardEvent } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type TagsInputProps = {
  name: string;
  label: string;
  placeholder?: string;
};

export const TagsInput = ({ name, label, placeholder }: TagsInputProps) => {
  const { control } = useFormContext();
  const [input, setInput] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const tags = (field.value ?? []) as string[];

        const addTag = (raw: string) => {
          const value = raw.trim();

          if (!value || tags.includes(value)) return;

          field.onChange([...tags, value]);
          setInput('');
        };

        const removeTag = (tag: string) => {
          field.onChange(tags.filter(item => item !== tag));
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
              value={input}
              label={label}
              placeholder={placeholder}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              onChange={event => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (input.trim()) addTag(input);
              }}
              sx={{ maxWidth: { xs: '100%', md: '50%' } }}
            />

            {Boolean(tags.length) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => removeTag(tag)}
                  />
                ))}
              </Box>
            )}
          </Stack>
        );
      }}
    />
  );
};
