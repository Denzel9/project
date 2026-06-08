import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';

import { useMessenger } from '@/features/chat';
import { ROUTES } from '@/shared/config/routes';
import { PageLayout } from '@/widgets';

import { ChatConversation } from './ChatConversation';
import { Contacts } from './Contacts';

export const ChatPage = () => {
  const navigate = useNavigate();

  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectConversation,
    messages,
    currentUserId,
    draft,
    setDraft,
    sendMessage,
    isLoading,
    error,
  } = useMessenger();

  const peer = selectedConversation?.peer ?? null;
  const headerTime = selectedConversation?.lastMessage
    ? format(new Date(selectedConversation.lastMessage.createdAt), 'HH:mm')
    : selectedConversation
      ? format(new Date(selectedConversation.updatedAt), 'HH:mm')
      : '';

  const isInitialLoading = isLoading && conversations.length === 0;

  if (isInitialLoading) {
    return (
      <PageLayout title="Мессенджер">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!isLoading && !conversations.length) {
    return (
      <PageLayout
        title="Мессенджер"
        sx={{ height: 'calc(100vh - 128px)' }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            bgcolor: 'white',
            borderRadius: '32px',
            p: 4,
            mt: 2,
            width: '100%',
          }}
        >
          <Stack
            direction="column"
            spacing={2}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                fontWeight: 500,
                fontSize: '44px',
                opacity: 0.3,
              }}
            >
              Нет диалогов
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(ROUTES.INDEX)}
            >
              На главную
            </Button>
          </Stack>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Мессенджер">
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: '100%',
          mt: 2,
          height: 'calc(100vh - 128px)',
          overflowY: 'hidden',
        }}
      >
        <Contacts
          conversations={conversations}
          selectedId={selectedConversationId}
          isLoading={isLoading && conversations.length === 0}
          onSelect={selectConversation}
        />

        <Stack
          sx={{
            width: '70%',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {peer && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                bgcolor: 'white',
                p: 4,
                borderRadius: '32px',
                width: '100%',
                flexShrink: 0,
              }}
            >
              <Avatar
                src={peer.avatar ?? undefined}
                alt={peer.displayName}
                sx={{ width: 50, height: 50 }}
              />
              <Stack
                direction="column"
                spacing={1}
              >
                <Typography variant="body1">{peer.displayName}</Typography>
                {headerTime && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {headerTime}
                  </Typography>
                )}
              </Stack>
            </Stack>
          )}

          <ChatConversation
            messages={messages}
            currentUserId={currentUserId}
            peer={peer}
            draft={draft}
            onDraftChange={setDraft}
            onSend={sendMessage}
            isLoading={isLoading && Boolean(selectedConversationId)}
            error={error}
          />
        </Stack>
      </Stack>
    </PageLayout>
  );
};

export default ChatPage;
