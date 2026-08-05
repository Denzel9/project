import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import {
  copyTaskMediaToConversation,
  wrapChatTaskTzMessage,
  getMessagePreview,
  useSearchMessagesQuery,
  type ChatMessage,
} from '@/entities/chat';
import { fetchTaskById, type Task } from '@/entities/task';
import { type UserSearchItem } from '@/entities/user';
import { useMessenger, formatTaskTzForChat } from '@/features/chat';
import { ROUTES } from '@/shared';
import { PageLayout, useSnackbarStore } from '@/widgets';

import { extractChatTaskTzMessages } from '../model/chatTaskTzMessages';
import { useChatPeerTasks } from '../model/hooks/useChatPeerTasks';

import { ChatAddTaskDialog } from './ChatAddTaskDialog';
import { ChatAttachmentsPanel } from './ChatAttachmentsPanel';
import { ChatConversation } from './ChatConversation';
import { ChatForwardMessageDialog } from './ChatForwardMessageDialog';
import { ChatHeader } from './ChatHeader';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatPhotoReportPanel } from './ChatPhotoReportPanel';
import { ChatSearchPanel } from './ChatSearchPanel';
import { ChatTaskTzPanel } from './ChatTaskTzPanel';
import { Contacts } from './Contacts';

const toMessageSide = (
  senderId: string,
  currentUserId: string | null
): 'incoming' | 'outgoing' =>
  currentUserId && senderId === currentUserId ? 'outgoing' : 'incoming';

export const ChatPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchItems, setSearchItems] = useState<ChatMessage[]>([]);
  const [isTaskTzOpen, setIsTaskTzOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isPhotoReportOpen, setIsPhotoReportOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);
  const [addTaskError, setAddTaskError] = useState<string | null>(null);
  const [forwardMessageId, setForwardMessageId] = useState<string | null>(null);
  const [forwardError, setForwardError] = useState<string | null>(null);

  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const { setSnackbarOpen } = useSnackbarStore();

  const {
    error,
    draft,
    setDraft,
    messages,
    unreadDividerMessageId,
    isLoading,
    sendMessage,
    sendTextMessage,
    deleteMessage,
    editMessage,
    forwardMessage,
    pendingFiles,
    currentUserId,
    conversations,
    isSendingMedia,
    isDeletingMessage,
    deletingMessageId,
    isEditingMessage,
    editingMessageId,
    isForwardingMessage,
    forwardingMessageId,
    addPendingFiles,
    recipientIdParam,
    removePendingFile,
    selectConversation,
    selectedConversation,
    isOpeningConversation,
    selectedConversationId,
    clearError,
    retryError,
    openDraftChat,
  } = useMessenger();

  const isDesktopSearch = isSearchOpen && !isMobile;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isDesktopSearch) {
      setTimeout(() => {
        setDebouncedQuery('');
        setSearchPage(1);
        setSearchItems([]);
      }, 0);
    }
  }, [isDesktopSearch]);

  useEffect(() => {
    setTimeout(() => {
      setSearchPage(1);
      setSearchItems([]);
    }, 0);
  }, [debouncedQuery, selectedConversationId]);

  const canSearch = isDesktopSearch && debouncedQuery.length >= 2;

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    error: searchError,
  } = useSearchMessagesQuery(canSearch ? selectedConversationId : null, {
    q: debouncedQuery,
    page: searchPage,
    limit: 20,
  });

  useEffect(() => {
    if (!canSearch || !searchData) return;

    setTimeout(() => {
      setSearchItems(prev =>
        searchPage === 1 ? searchData.items : [...prev, ...searchData.items]
      );
    }, 0);
  }, [canSearch, searchData, searchPage]);

  const searchHasMore = Boolean(
    searchData && searchData.page * searchData.limit < searchData.total
  );

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
      return;
    }

    setIsSearchOpen(true);
  };

  const {
    photoReportTasks,
    peerAssignedTasks,
    canAddPhotoReport,
    isLoading: isPeerTasksLoading,
  } = useChatPeerTasks(selectedConversation?.peer?.id);

  const headerTime = selectedConversation?.lastMessage
    ? format(new Date(selectedConversation.lastMessage.createdAt), 'HH:mm')
    : selectedConversation
      ? format(new Date(selectedConversation.updatedAt), 'HH:mm')
      : '';

  const hasTaskTzMessages = useMemo(
    () => extractChatTaskTzMessages(messages).length > 0,
    [messages],
  );

  useEffect(() => {
    if (
      (recipientIdParam && selectedConversationId) ||
      (selectedConversation && !selectedConversationId)
    ) {
      setTimeout(() => {
        setMobileShowChat(true);
      }, 0);
    }
  }, [recipientIdParam, selectedConversation, selectedConversationId]);

  useEffect(() => {
    setTimeout(() => {
      setIsPhotoReportOpen(false);
      setIsAddTaskOpen(false);
      setIsTaskTzOpen(false);
      setIsSearchOpen(false);
      setSearchQuery('');
    }, 0);
  }, [selectedConversationId, selectedConversation?.peer?.id]);

  const handleAddTask = useCallback(
    async (task: Task) => {
      if (addingTaskId) {
        return;
      }

      setAddingTaskId(task.id);
      setAddTaskError(null);

      try {
        const fullTask = await fetchTaskById(task.id);
        const markdown = formatTaskTzForChat(fullTask);
        const message = wrapChatTaskTzMessage(fullTask.id, markdown);

        const media =
          fullTask.media?.length && selectedConversationId
            ? await copyTaskMediaToConversation({
                taskId: fullTask.id,
                conversationId: selectedConversationId,
                kind: 'main',
              })
            : undefined;

        const sent = await sendTextMessage(message, {
          ...(media?.length ? { media } : {}),
        });

        if (sent) {
          setIsAddTaskOpen(false);
        } else {
          setAddTaskError(
            'Не удалось отправить ТЗ. Проверьте соединение с чатом.',
          );
        }
      } catch {
        setAddTaskError('Не удалось загрузить задачу или медиа');
      } finally {
        setAddingTaskId(null);
      }
    },
    [addingTaskId, selectedConversationId, sendTextMessage],
  );

  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);

    if (isMobile) {
      setMobileShowChat(true);
    }
  };

  const handleStartChat = useCallback(
    (user: UserSearchItem) => {
      const existing = conversations.find(
        conversation => conversation.peer.id === user.id
      );

      if (existing) {
        selectConversation(existing.id);
      } else {
        openDraftChat({
          id: user.id,
          role: user.role,
          avatar: user.avatar,
          displayName: user.displayName,
        });
      }

      if (isMobile) {
        setMobileShowChat(true);
      }
    },
    [conversations, isMobile, openDraftChat, selectConversation]
  );

  const handleBackToContacts = () => {
    setMobileShowChat(false);
  };

  const handleOpenProfile = () => {
    navigate(`${ROUTES.PROFILE}?userId=${selectedConversation?.peer?.id}`);
  };

  const forwardingMessage = useMemo(
    () => messages.find(message => message.id === forwardMessageId) ?? null,
    [forwardMessageId, messages],
  );

  const forwardMessagePreview = forwardingMessage
    ? getMessagePreview(
      forwardingMessage.content,
      forwardingMessage.media ?? [],
      forwardingMessage.isRedirected,
    )
    : null;

  const handleForwardMessage = useCallback((messageId: string) => {
    setForwardError(null);
    setForwardMessageId(messageId);
  }, []);

  const handleConfirmForward = useCallback(
    async (peerId: string) => {
      if (!forwardMessageId) {
        return false;
      }

      setForwardError(null);
      const result = await forwardMessage(forwardMessageId, peerId);

      if (!result.success) {
        setForwardError(result.error ?? 'Не удалось переслать сообщение');
        return false;
      }

      setForwardMessageId(null);
      setSnackbarOpen(true, 'Сообщение успешно переслано', 'success');
      return true;
    },
    [forwardMessage, forwardMessageId, setSnackbarOpen],
  );

  const showContacts = !isMobile || !mobileShowChat;
  const showChatPanel = !isMobile || mobileShowChat;

  const contactsConversations = useMemo(() => {
    if (
      !selectedConversation ||
      selectedConversationId ||
      conversations.some(
        conversation => conversation.peer.id === selectedConversation.peer.id
      )
    ) {
      return conversations;
    }

    return [selectedConversation, ...conversations];
  }, [conversations, selectedConversation, selectedConversationId]);

  const isInitialLoading = isLoading && conversations.length === 0;
  const isEmpty =
    !isLoading &&
    !recipientIdParam &&
    !isOpeningConversation &&
    !selectedConversation &&
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
        spacing={1}
        sx={{
          width: '100%',
          height: '100%',
          overflowY: 'hidden',
        }}
      >
        {showContacts && (
          <Contacts
            conversations={contactsConversations}
            selectedId={selectedConversationId}
            selectedPeerId={selectedConversation?.peer.id ?? null}
            onSelect={handleSelectConversation}
            onStartChat={handleStartChat}
            isLoading={isLoading && conversations.length === 0}
          />
        )}

        {showChatPanel && (
          <Stack
            spacing={1}
            direction="column"
            sx={{
              flex: 1,
              minHeight: 0,
              width: { xs: '100%', md: '70%' },
            }}
          >
            <ChatHeader
              isMobile={isMobile}
              headerTime={headerTime}
              peer={selectedConversation?.peer}
              hasActiveTasks={canAddPhotoReport}
              hasTaskTzMessages={hasTaskTzMessages}
              isSearchOpen={isSearchOpen}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onToggleSearch={handleToggleSearch}
              onOpenProfile={handleOpenProfile}
              onBackToContacts={handleBackToContacts}
              onOpenTaskTz={() => setIsTaskTzOpen(true)}
              onOpenAttachments={() => setIsAttachmentsOpen(true)}
              onOpenPhotoReport={() => setIsPhotoReportOpen(true)}
              onOpenAddTask={() => {
                setAddTaskError(null);
                setIsAddTaskOpen(true);
              }}
            />

            {isPhotoReportOpen ? (
              <ChatPhotoReportPanel
                tasks={photoReportTasks}
                currentUserId={currentUserId}
                onClose={() => setIsPhotoReportOpen(false)}
              />
            ) : canSearch ? (
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  bgcolor: 'white',
                  borderRadius: { xs: '16px', md: '32px' },
                  border: '1px solid',
                  borderColor: 'divider',
                  p: { xs: 2, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {isSearchLoading && searchItems.length === 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={32} />
                  </Box>
                )}

                {searchError && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ textAlign: 'center', py: 2 }}
                  >
                    Не удалось выполнить поиск
                  </Typography>
                )}

                {!isSearchLoading && !searchError && !searchItems.length && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    Ничего не найдено
                  </Typography>
                )}

                {searchItems.map(message => (
                  <Box key={message.id}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 0.5, display: 'block' }}
                    >
                      {format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm')}
                    </Typography>

                    <ChatMessageBubble
                      messageId={message.id}
                      senderId={message.senderId}
                      actorDisplayName={message.actorDisplayName}
                      actorKind={message.actorKind}
                      createdAt={message.createdAt}
                      currentUserId={currentUserId}
                      text={message.content}
                      media={message.media}
                      highlight={debouncedQuery}
                      editedAt={message.editedAt}
                      isRedirected={message.isRedirected}
                      side={toMessageSide(message.senderId, currentUserId)}
                      isRead={message.isRead}
                    />
                  </Box>
                ))}

                {searchHasMore && (
                  <Button
                    variant="outlined"
                    disabled={isSearchFetching}
                    onClick={() => setSearchPage(prev => prev + 1)}
                  >
                    {isSearchFetching ? 'Загрузка…' : 'Загрузить ещё'}
                  </Button>
                )}
              </Box>
            ) : (
              <ChatConversation
                draft={draft}
                error={error}
                messages={messages}
                unreadDividerMessageId={unreadDividerMessageId}
                onSend={sendMessage}
                onDeleteMessage={messageId => void deleteMessage(messageId)}
                onEditMessage={editMessage}
                onForwardMessage={handleForwardMessage}
                isDeletingMessage={isDeletingMessage}
                deletingMessageId={deletingMessageId}
                isEditingMessage={isEditingMessage}
                editingMessageId={editingMessageId}
                onDraftChange={setDraft}
                isSending={isSendingMedia}
                pendingFiles={pendingFiles}
                currentUserId={currentUserId}
                onAttachFiles={addPendingFiles}
                onRemoveFile={removePendingFile}
                peer={selectedConversation?.peer}
                isLoading={isLoading && Boolean(selectedConversationId)}
                onRetryError={retryError}
                onDismissError={clearError}
              />
            )}
          </Stack>
        )}
      </Stack>

      {selectedConversationId && (
        <>
          <ChatSearchPanel
            open={isSearchOpen && isMobile}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            currentUserId={currentUserId}
            onClose={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            conversationId={selectedConversationId}
          />

          <ChatAttachmentsPanel
            open={isAttachmentsOpen}
            conversationId={selectedConversationId}
            onClose={() => setIsAttachmentsOpen(false)}
          />

          <ChatTaskTzPanel
            open={isTaskTzOpen}
            messages={messages}
            tasks={peerAssignedTasks}
            currentUserId={currentUserId}
            onClose={() => setIsTaskTzOpen(false)}
          />

          <ChatAddTaskDialog
            open={isAddTaskOpen}
            tasks={peerAssignedTasks}
            isLoading={isPeerTasksLoading}
            peerName={selectedConversation?.peer.displayName}
            addingTaskId={addingTaskId}
            error={addTaskError}
            onAddTask={task => void handleAddTask(task)}
            onClose={() => {
              setAddTaskError(null);
              setIsAddTaskOpen(false);
            }}
          />

          <ChatForwardMessageDialog
            open={Boolean(forwardMessageId)}
            conversations={conversations}
            currentConversationId={selectedConversationId}
            currentPeerId={selectedConversation?.peer?.id}
            messagePreview={forwardMessagePreview}
            isForwarding={
              isForwardingMessage && forwardingMessageId === forwardMessageId
            }
            error={forwardError}
            onForward={handleConfirmForward}
            onClose={() => {
              if (isForwardingMessage) {
                return;
              }

              setForwardError(null);
              setForwardMessageId(null);
            }}
          />
        </>
      )}
    </PageLayout>
  );
};

export default ChatPage;
