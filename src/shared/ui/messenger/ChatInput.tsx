import { AttachFile, Close, Mood, Send } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import { CHAT_MEDIA_ACCEPT } from '@/entities';

import { ChatEmojiPicker } from './ChatEmojiPicker';

type ChatInputProps = {
  value: string;
  onSend: () => void;
  disabled?: boolean;
  executorId?: string;
  isSending?: boolean;
  pendingFiles: File[];
  placeholder?: string;
  isExecutorApprove?: boolean;
  onChange: (value: string) => void;
  onAttachFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
};

export const ChatInput = ({
  value,
  onSend,
  onChange,
  executorId,
  onRemoveFile,
  pendingFiles,
  onAttachFiles,
  disabled = false,
  isExecutorApprove,
  isSending = false,
  placeholder = 'Введите сообщение…',
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);

  const hasDraft = value.trim().length > 0;
  const requiresExecutorApproval = isExecutorApprove !== undefined;
  const isInputDisabled =
    disabled ||
    isSending ||
    (requiresExecutorApproval && (!executorId || !isExecutorApprove));
  const canSend =
    (hasDraft || pendingFiles.length > 0) && !isSending && !isInputDisabled;

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

  const insertEmoji = (emoji: string) => {
    const input = textInputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    const newValue = `${value.slice(0, start)}${emoji}${value.slice(end)}`;

    onChange(newValue);

    requestAnimationFrame(() => {
      input?.focus();
      const cursorPosition = start + emoji.length;
      input?.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const handleOpenEmojiPicker = (event: MouseEvent<HTMLButtonElement>) => {
    setEmojiAnchor(event.currentTarget);
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
        size="small"
        multiline
        maxRows={4}
        inputRef={textInputRef}
        disabled={isInputDisabled}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  size="small"
                  color="inherit"
                  disabled={isInputDisabled}
                  onClick={handleOpenEmojiPicker}
                >
                  <Mood />
                </IconButton>

                <IconButton
                  size="small"
                  color="inherit"
                  disabled={isInputDisabled}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AttachFile />
                </IconButton>

                <input
                  hidden
                  multiple
                  type="file"
                  ref={fileInputRef}
                  accept={CHAT_MEDIA_ACCEPT}
                  onChange={handleFileChange}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {canSend && (
                  <IconButton
                    size="small"
                    color="primary"
                    disabled={!canSend}
                    onClick={onSend}
                  >
                    <Send />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          },
        }}
      />

      <ChatEmojiPicker
        anchorEl={emojiAnchor}
        open={Boolean(emojiAnchor)}
        onClose={() => setEmojiAnchor(null)}
        onEmojiSelect={insertEmoji}
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
