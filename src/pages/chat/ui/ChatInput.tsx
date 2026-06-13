import { AttachFile, Close, Mic, Mood, Send } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRef, type ChangeEvent, type KeyboardEvent } from 'react';

import { CHAT_MEDIA_ACCEPT } from '@/entities/chat';

type ChatInputProps = {
  value: string;
  pendingFiles: File[];
  isSending?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onAttachFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onSend: () => void;
};

export const ChatInput = ({
  value,
  pendingFiles,
  isSending = false,
  disabled = false,
  onChange,
  onAttachFiles,
  onRemoveFile,
  onSend,
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasDraft = value.trim().length > 0;
  const canSend = (hasDraft || pendingFiles.length > 0) && !isSending && !disabled;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (canSend) {
        onSend();
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length) {
      onAttachFiles(files);
    }

    event.target.value = '';
  };

  return (
    <Stack spacing={1}>
      {pendingFiles.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: 'wrap' }}
        >
          {pendingFiles.map((file, index) => {
            const isImage = file.type.startsWith('image/');
            const previewUrl = isImage ? URL.createObjectURL(file) : null;

            return (
              <Chip
                key={`${file.name}-${index}`}
                label={file.name}
                onDelete={() => onRemoveFile(index)}
                deleteIcon={<Close />}
                avatar={
                  previewUrl ? (
                    <Box
                      component="img"
                      src={previewUrl}
                      alt={file.name}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : undefined
                }
                sx={{ maxWidth: 220 }}
              />
            );
          })}
        </Stack>
      )}

      <TextField
        fullWidth
        multiline
        maxRows={4}
        disabled={disabled || isSending}
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
                  disabled={disabled || isSending}
                >
                  <Mood />
                </IconButton>
                <IconButton
                  size="small"
                  color="inherit"
                  disabled={disabled || isSending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AttachFile />
                </IconButton>
                <input
                  ref={fileInputRef}
                  hidden
                  multiple
                  type="file"
                  accept={CHAT_MEDIA_ACCEPT}
                  onChange={handleFileChange}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {canSend ? (
                  <IconButton
                    size="small"
                    color="primary"
                    disabled={!canSend}
                    onClick={onSend}
                  >
                    <Send />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    color="inherit"
                    disabled={disabled || isSending}
                  >
                    <Mic />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          },
        }}
      />

      {isSending && (
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Отправка…
        </Typography>
      )}
    </Stack>
  );
};
