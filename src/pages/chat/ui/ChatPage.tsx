import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);

  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const {
    error,
    draft,
    setDraft,
    messages,
    isLoading,
    sendMessage,
    pendingFiles,
    currentUserId,
    conversations,
    isSendingMedia,
    addPendingFiles,
    recipientIdParam,
    removePendingFile,
    selectConversation,
    selectedConversation,
    isOpeningConversation,
    selectedConversationId,
  } = useMessenger();

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

  const handleOpenProfile = () => {
    navigate(`${ROUTES.PROFILE}?userId=${selectedConversation?.peer?.id}`);
  };

  const showContacts = !isMobile || !mobileShowChat;
  const showChatPanel = !isMobile || mobileShowChat;

  const isInitialLoading = isLoading && conversations.length === 0;
  const isEmpty =
    !isLoading &&
    !recipientIdParam &&
    !isOpeningConversation &&
    !conversations.length;

  if (isInitialLoading) {
    return (
      <PageLayout isScreenHeight>
        <Box
          sx={{
            height: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (isEmpty) {
    return (
      <PageLayout isScreenHeight>
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
            spacing={2}
            direction="column"
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                opacity: 0.3,
                fontWeight: 500,
                textAlign: 'center',
                fontSize: { xs: '28px', md: '44px' },
              }}
            >
              Нет диалогов
            </Typography>

            <Button
              color="primary"
              variant="contained"
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
    <PageLayout isScreenHeight>
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
            onSelect={handleSelectConversation}
            isLoading={isLoading && conversations.length === 0}
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
              peer={selectedConversation?.peer}
              onOpenProfile={handleOpenProfile}
              onBackToContacts={handleBackToContacts}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenAttachments={() => setIsAttachmentsOpen(true)}
            />

            <ChatConversation
              draft={draft}
              error={error}
              messages={messages}
              onSend={sendMessage}
              onDraftChange={setDraft}
              isSending={isSendingMedia}
              pendingFiles={pendingFiles}
              currentUserId={currentUserId}
              onAttachFiles={addPendingFiles}
              onRemoveFile={removePendingFile}
              peer={selectedConversation?.peer}
              isLoading={isLoading && Boolean(selectedConversationId)}
            />
          </Stack>
        )}
      </Stack>

      {selectedConversationId && (
        <>
          <ChatSearchPanel
            open={isSearchOpen}
            currentUserId={currentUserId}
            onClose={() => setIsSearchOpen(false)}
            conversationId={selectedConversationId}
          />

          <ChatAttachmentsPanel
            open={isAttachmentsOpen}
            conversationId={selectedConversationId}
            onClose={() => setIsAttachmentsOpen(false)}
          />
        </>
      )}
    </PageLayout>
  );
};

export default ChatPage;
