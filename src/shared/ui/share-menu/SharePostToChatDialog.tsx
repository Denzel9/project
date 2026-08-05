import { Close } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import {
  sortConversationsByUnread,
  type ChatConversation,
} from '@/entities/chat';
import { ChatContactSearch } from '@/features/chat';

type SharePostToChatDialogProps = {
  open: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  isLoading?: boolean;
  isSending?: boolean;
  error?: string | null;
  postTitle?: string | null;
  postUrl?: string | null;
  onSend: (peerId: string) => Promise<boolean>;
};

export const SharePostToChatDialog = ({
  open,
  onClose,
  conversations,
  isLoading = false,
  isSending = false,
  error = null,
  postTitle = null,
  postUrl = null,
  onSend,
}: SharePostToChatDialogProps) => {
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedPeerId(null);
    }
  }, [open]);

  const availableConversations = useMemo(
    () => sortConversationsByUnread(conversations),
    [conversations]
  );

  const handleClose = () => {
    if (isSending) {
      return;
    }

    onClose();
  };

  const handleSend = async () => {
    if (!selectedPeerId || isSending) {
      return;
    }

    const success = await onSend(selectedPeerId);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: '24px', p: { xs: 2, sm: 3 } },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Отправить в чат</Typography>
        <IconButton
          aria-label="Закрыть"
          onClick={handleClose}
          disabled={isSending}
        >
          <Close />
        </IconButton>
      </Stack>

      {(postTitle || postUrl) && (
        <Box
          sx={{
            mb: 2,
            px: 1.5,
            py: 1.25,
            borderRadius: '12px',
            bgcolor: 'action.hover',
          }}
        >
          {postTitle && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {postTitle}
            </Typography>
          )}
          {postUrl && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: postTitle ? 0.5 : 0,
                wordBreak: 'break-all',
              }}
            >
              {postUrl}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <ChatContactSearch
          disabled={isSending}
          onSelect={user => {
            setSelectedPeerId(user.id);
          }}
        />
      </Box>

      <Box
        sx={{
          maxHeight: 320,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          p: 1,
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!isLoading && !availableConversations.length && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 3 }}
          >
            Нет доступных контактов
          </Typography>
        )}

        {!isLoading &&
          availableConversations.map(conversation => {
            const isSelected = selectedPeerId === conversation.peer.id;

            return (
              <Stack
                key={conversation.id}
                direction="row"
                spacing={1.5}
                onClick={() => {
                  if (!isSending) {
                    setSelectedPeerId(conversation.peer.id);
                  }
                }}
                sx={{
                  p: 1.5,
                  cursor: isSending ? 'default' : 'pointer',
                  borderRadius: '12px',
                  alignItems: 'center',
                  bgcolor: isSelected ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: isSending
                      ? 'transparent'
                      : isSelected
                        ? 'primary.light'
                        : 'action.hover',
                  },
                }}
              >
                <Avatar src={conversation.peer.avatar ?? undefined}>
                  {conversation.peer.displayName.charAt(0)}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body1"
                    noWrap
                    sx={{
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'common.white' : 'text.primary',
                    }}
                  >
                    {conversation.peer.displayName}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: 'flex-end', mt: 3 }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isSending}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          disabled={!selectedPeerId || isSending}
          onClick={() => void handleSend()}
          startIcon={
            isSending ? (
              <CircularProgress
                size={16}
                color="inherit"
              />
            ) : undefined
          }
        >
          Отправить
        </Button>
      </Stack>
    </Dialog>
  );
};
