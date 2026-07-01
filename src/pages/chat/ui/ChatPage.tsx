import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useMessenger } from '@/features/chat';
import { ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import { ChatAttachmentsPanel } from './ChatAttachmentsPanel';
import { ChatConversation } from './ChatConversation';
import { ChatHeader } from './ChatHeader';
import { ChatSearchPanel } from './ChatSearchPanel';
import { Contacts } from './Contacts';

export const ChatPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);

  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectConversation,
    messages,
    currentUserId,
    draft,
    setDraft,
    pendingFiles,
    addPendingFiles,
    removePendingFile,
    sendMessage,
    isSendingMedia,
    isLoading,
    isOpeningConversation,
    recipientIdParam,
    error,
  } = useMessenger();

  const peer = selectedConversation?.peer ?? null;
  const headerTime = selectedConversation?.lastMessage
    ? format(new Date(selectedConversation.lastMessage.createdAt), 'HH:mm')
    : selectedConversation
      ? format(new Date(selectedConversation.updatedAt), 'HH:mm')
      : '';

  useEffect(() => {
    if (recipientIdParam && selectedConversationId) {
      setTimeout(() => {
        setMobileShowChat(true);
      }, 0);
    }
  }, [recipientIdParam, selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);

    if (isMobile) {
      setMobileShowChat(true);
    }
  };

  const handleBackToContacts = () => {
    setMobileShowChat(false);
  };

  const showContacts = !isMobile || !mobileShowChat;
  const showChatPanel = !isMobile || mobileShowChat;

  const isInitialLoading = isLoading && conversations.length === 0;

  if (isInitialLoading) {
    return (
      <PageLayout
        title="Мессенджер"
        isScreenHeight
      >
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

  if (
    !isLoading &&
    !conversations.length &&
    !recipientIdParam &&
    !isOpeningConversation
  ) {
    return (
      <PageLayout
        title="Мессенджер"
        isScreenHeight
      >
        <Box
          sx={{
            mt: 2,
            width: '100%',
            height: '100%',
            display: 'flex',
            bgcolor: 'white',
            p: { xs: 2, md: 4 },
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: { xs: '16px', md: '32px' },
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
                fontSize: { xs: '28px', md: '44px' },
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
    <PageLayout
      title="Мессенджер"
      isScreenHeight
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: '100%',
          height: '100%',
          overflowY: 'hidden',
        }}
      >
        {showContacts && (
          <Contacts
            conversations={conversations}
            selectedId={selectedConversationId}
            isLoading={isLoading && conversations.length === 0}
            onSelect={handleSelectConversation}
          />
        )}

        {showChatPanel && (
          <Stack
            sx={{
              gap: 2,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: '70%' },
            }}
          >
            <ChatHeader
              isMobile={isMobile}
              headerTime={headerTime}
              peer={peer ?? undefined}
              onBackToContacts={handleBackToContacts}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenAttachments={() => setIsAttachmentsOpen(true)}
              onOpenProfile={() =>
                navigate(`${ROUTES.PROFILE}?userId=${peer?.id}`)
              }
            />

            <ChatConversation
              messages={messages}
              currentUserId={currentUserId}
              peer={peer}
              draft={draft}
              pendingFiles={pendingFiles}
              isSending={isSendingMedia}
              onDraftChange={setDraft}
              onAttachFiles={addPendingFiles}
              onRemoveFile={removePendingFile}
              onSend={() => void sendMessage()}
              isLoading={isLoading && Boolean(selectedConversationId)}
              error={error}
            />
          </Stack>
        )}
      </Stack>

      {selectedConversationId && (
        <>
          <ChatSearchPanel
            open={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            conversationId={selectedConversationId}
            currentUserId={currentUserId}
          />

          <ChatAttachmentsPanel
            open={isAttachmentsOpen}
            onClose={() => setIsAttachmentsOpen(false)}
            conversationId={selectedConversationId}
          />
        </>
      )}
    </PageLayout>
  );
};

export default ChatPage;
