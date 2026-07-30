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
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  sortConversationsByUnread,
  type ChatConversation,
} from '@/entities/chat';

type ChatForwardMessageDialogProps = {
  open: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  currentConversationId: string | null;
  messagePreview?: string | null;
  isForwarding?: boolean;
  error?: string | null;
  onForward: (targetConversationId: string) => Promise<boolean>;
};
// TODO: add redirect media files
export const ChatForwardMessageDialog = ({
  open,
  onClose,
  conversations,
  currentConversationId,
  messagePreview = null,
  isForwarding = false,
  error = null,
  onForward,
}: ChatForwardMessageDialogProps) => {
  const [search, setSearch] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const availableConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortConversationsByUnread(
      conversations.filter(conversation => {
        if (conversation.id === currentConversationId) {
          return false;
        }

        if (!query) {
          return true;
        }

        return conversation.peer.displayName.toLowerCase().includes(query);
      })
    );
  }, [conversations, currentConversationId, search]);

  const previewText = messagePreview?.trim() ?? '';

  const handleClose = () => {
    if (isForwarding) {
      return;
    }

    setSearch('');
    setSelectedConversationId(null);
    onClose();
  };

  const handleForward = async () => {
    if (!selectedConversationId || isForwarding) {
      return;
    }

    const success = await onForward(selectedConversationId);

    if (success) {
      setSearch('');
      setSelectedConversationId(null);
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
        <Typography variant="h6">Переслать сообщение</Typography>
        <IconButton
          aria-label="Закрыть"
          onClick={handleClose}
          disabled={isForwarding}
        >
          <Close />
        </IconButton>
      </Stack>

      {previewText && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            px: 1.5,
            py: 1,
            borderRadius: '12px',
            bgcolor: 'action.hover',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {previewText}
        </Typography>
      )}

      <TextField
        label="Поиск чата"
        fullWidth
        value={search}
        disabled={isForwarding}
        onChange={event => setSearch(event.target.value)}
        sx={{ mb: 2 }}
      />

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
        {!availableConversations.length && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 3 }}
          >
            Нет доступных чатов
          </Typography>
        )}

        {availableConversations.map(conversation => {
          const isSelected = selectedConversationId === conversation.id;

          return (
            <Stack
              key={conversation.id}
              direction="row"
              spacing={1.5}
              onClick={() => {
                if (!isForwarding) {
                  setSelectedConversationId(conversation.id);
                }
              }}
              sx={{
                p: 1.5,
                cursor: isForwarding ? 'default' : 'pointer',
                borderRadius: '12px',
                alignItems: 'center',
                bgcolor: isSelected ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor: isForwarding
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
          disabled={isForwarding}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          disabled={!selectedConversationId || isForwarding}
          onClick={() => void handleForward()}
          startIcon={
            isForwarding ? (
              <CircularProgress
                size={16}
                color="inherit"
              />
            ) : undefined
          }
        >
          Переслать
        </Button>
      </Stack>
    </Dialog>
  );
};
