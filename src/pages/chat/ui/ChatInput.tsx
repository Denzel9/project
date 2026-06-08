import { AttachFile, Mic, Mood, Send } from '@mui/icons-material';
import {
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';

import type { KeyboardEvent } from 'react';

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export const ChatInput = ({ value, onChange, onSend }: ChatInputProps) => {
  const hasDraft = value.trim().length > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <TextField
      fullWidth
      multiline
      maxRows={4}
      value={value}
      placeholder="Введите сообщение…"
      onChange={event => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      slotProps={{
        input: {
          sx: {
            py: 1.5,
            bgcolor: 'common.white',
            borderRadius: '999px',
            boxShadow: 1,
            '& fieldset': { border: 'none' },
          },
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                size="small"
                color="inherit"
              >
                <Mood />
              </IconButton>
              <IconButton
                size="small"
                color="inherit"
              >
                <AttachFile />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {hasDraft ? (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={onSend}
                >
                  <Send />
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  color="inherit"
                >
                  <Mic />
                </IconButton>
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
