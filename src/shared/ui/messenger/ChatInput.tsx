import {
  Send,
  Mood,
  AttachFile,
  DeleteOutlined,
  DescriptionOutlined,
} from '@mui/icons-material';
import {
  Box,
  CircularProgress,
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
  isExecutorApprove?: boolean | null;
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
          spacing={2}
          direction="row"
          sx={{ flexWrap: 'wrap' }}
        >
          {pendingFiles.map((file, index) => {
            const isImage = file.type.startsWith('image/');
            const previewUrl = isImage ? URL.createObjectURL(file) : null;

            return (
              <Stack
                spacing={1}
                direction="row"
                key={`${file.name}-${index}`}
                sx={{
                  py: 1,
                  px: 1.5,
                  maxWidth: 220,
                  borderRadius: '12px',
                  alignItems: 'center',
                  bgcolor: 'action.hover',
                  position: 'relative',
                }}
              >
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt={file.name}
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <DescriptionOutlined
                    sx={{ fontSize: 40, flexShrink: 0 }}
                    color="disabled"
                  />
                )}

                <Typography
                  variant="caption"
                  title={file.name}
                  sx={{
                    minWidth: 0,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pr: 2,
                  }}
                >
                  {file.name}
                </Typography>

                <IconButton
                  size="small"
                  color="inherit"
                  aria-label="Удалить файл"
                  onClick={() => onRemoveFile(index)}
                  sx={{ position: 'absolute', right: -4, top: -4 }}
                >
                  <DeleteOutlined color="error" />
                </IconButton>
              </Stack>
            );
          })}
        </Stack>
      )}

      <TextField
        fullWidth
        multiline
        maxRows={4}
        size="medium"
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

                {isSending && (
                  <CircularProgress
                    size={24}
                    sx={{ mr: 1 }}
                  />
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
    </Stack>
  );
};
