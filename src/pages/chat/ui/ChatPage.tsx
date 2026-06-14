import { ArrowBack, MoreVert, Search } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { useMessenger } from '@/features/chat';
import { ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import { ChatAttachmentsPanel } from './ChatAttachmentsPanel';
import { ChatConversation } from './ChatConversation';
import { ChatSearchPanel } from './ChatSearchPanel';
import { Contacts } from './Contacts';

export const ChatPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleOpenAttachments = () => {
    handleCloseMenu();
    setIsAttachmentsOpen(true);
  };

  const handleOpenProfile = () => {
    handleCloseMenu();
    navigate(`${ROUTES.PROFILE}?userId=${peer?.id}`);
  };

  const showContacts = !isMobile || !mobileShowChat;
  const showChatPanel = !isMobile || mobileShowChat;

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

  if (
    !isLoading &&
    !conversations.length &&
    !recipientIdParam &&
    !isOpeningConversation
  ) {
    return (
      <PageLayout
        isFullHeight
        title="Мессенджер"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            bgcolor: 'white',
            borderRadius: { xs: '16px', md: '32px' },
            p: { xs: 2, md: 4 },
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
    <PageLayout title="Мессенджер">
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: '100%',
          mt: 2,
          height: { xs: 'calc(100dvh - 105px)', md: 'calc(100vh - 128px)' },
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
              width: { xs: '100%', md: '70%' },
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
                  p: { xs: 2, md: 4 },
                  width: '100%',
                  flexShrink: 0,
                  bgcolor: 'white',
                  alignItems: 'center',
                  borderRadius: { xs: '16px', md: '32px' },
                  justifyContent: 'space-between',
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', minWidth: 0, cursor: 'pointer' }}
                  onClick={() =>
                    navigate(`${ROUTES.PROFILE}?userId=${peer.id}`)
                  }
                >
                  {isMobile && (
                    <IconButton
                      size="small"
                      onClick={handleBackToContacts}
                    >
                      <ArrowBack />
                    </IconButton>
                  )}

                  <Avatar
                    src={peer.avatar ?? undefined}
                    alt={peer.displayName}
                    sx={{ width: 50, height: 50 }}
                  />
                  <Stack
                    direction="column"
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      variant="body1"
                      noWrap
                      sx={{
                        transition: 'color 0.2s ease-in-out',
                        ':hover': { color: 'primary.main' },
                      }}
                    >
                      {peer.displayName}
                    </Typography>

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

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', flexShrink: 0 }}
                >
                  <IconButton onClick={() => setIsSearchOpen(true)}>
                    <Search />
                  </IconButton>

                  <IconButton onClick={handleOpenMenu}>
                    <MoreVert />
                  </IconButton>

                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem onClick={handleOpenProfile}>
                      Перейти к профилю
                    </MenuItem>

                    <MenuItem onClick={handleOpenAttachments}>
                      Вложения
                    </MenuItem>
                  </Menu>
                </Stack>
              </Stack>
            )}

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
