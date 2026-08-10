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
import { useMemo, useState } from 'react';

import {
  sortConversationsByUnread,
  type ChatConversation,
} from '@/entities/chat';
import { USER_ROLE } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { ChatContactSearch } from '@/features/chat';

type ChatForwardMessageDialogProps = {
  open: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  currentConversationId: string | null;
  currentPeerId?: string | null;
  messagePreview?: string | null;
  isForwarding?: boolean;
  error?: string | null;
  onForward: (peerId: string) => Promise<boolean>;
};

export const ChatForwardMessageDialog = ({
  open,
  onClose,
  conversations,
  currentConversationId,
  currentPeerId = null,
  messagePreview = null,
  isForwarding = false,
  error = null,
  onForward,
}: ChatForwardMessageDialogProps) => {
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const role = useAuthStore(state => state.role);
  const canSearchContacts = role !== USER_ROLE.MANAGER;

  const availableConversations = useMemo(
    () =>
      sortConversationsByUnread(
        conversations.filter(
          conversation => conversation.id !== currentConversationId
        )
      ),
    [conversations, currentConversationId]
  );

  const excludeUserIds = useMemo(
    () => (currentPeerId ? [currentPeerId] : []),
    [currentPeerId]
  );

  const previewText = messagePreview?.trim() ?? '';

  const handleClose = () => {
    if (isForwarding) {
      return;
    }

    setSelectedPeerId(null);
    onClose();
  };

  const handleForward = async () => {
    if (!selectedPeerId || isForwarding) {
      return;
    }

    const success = await onForward(selectedPeerId);

    if (success) {
      setSelectedPeerId(null);
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
        <Typography variant="h6">
          {messagePreview?.startsWith('Выбрано сообщений:')
            ? 'Переслать сообщения'
            : 'Переслать сообщение'}
        </Typography>
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

      <Box sx={{ mb: 2 }}>
        {canSearchContacts && (
          <ChatContactSearch
            size="small"
            disabled={isForwarding}
            excludeUserIds={excludeUserIds}
            onSelect={user => {
              setSelectedPeerId(user.id);
            }}
          />
        )}
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
          const isSelected = selectedPeerId === conversation.peer.id;
          const displayName = conversation.isNotes
            ? 'Заметки'
            : conversation.peer.displayName;

          return (
            <Stack
              key={conversation.id}
              direction="row"
              spacing={1.5}
              onClick={() => {
                if (!isForwarding) {
                  setSelectedPeerId(conversation.peer.id);
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
                {displayName.charAt(0)}
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
                  {displayName}
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
          disabled={!selectedPeerId || isForwarding}
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
