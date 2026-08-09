import {
  Box,
  CircularProgress,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import {
  copyTaskMediaToConversation,
  wrapChatTaskTzMessage,
  getMessagePreview,
  type ChatMessage,
} from '@/entities/chat';
import { fetchTaskById, type Task } from '@/entities/task';
import { type UserSearchItem } from '@/entities/user';
import { useMessenger, formatTaskTzForChat } from '@/features/chat';
import { ROUTES, EmptyBlock } from '@/shared';
import {
  ChatAttachmentsPanel,
  ChatSearchPanel,
  ChatTaskTzPanel,
  extractChatTaskTzMessages,
  PageLayout,
  useChatPeerTasks,
  useSnackbarStore,
} from '@/widgets';

import { ChatAddTaskDialog } from './ChatAddTaskDialog';
import { ChatConversation } from './ChatConversation';
import { ChatForwardMessageDialog } from './ChatForwardMessageDialog';
import { ChatHeader } from './ChatHeader';
import { ChatPhotoReportPanel } from './ChatPhotoReportPanel';
import { Contacts } from './Contacts';

export const ChatPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);
  const [isTaskTzOpen, setIsTaskTzOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isPhotoReportOpen, setIsPhotoReportOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);
  const [addTaskError, setAddTaskError] = useState<string | null>(null);
  const [forwardMessageIds, setForwardMessageIds] = useState<string[]>([]);
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
    pinnedMessages,
    isMessagePinned,
    onTogglePinMessage,
    isLoading,
    sendMessage,
    sendTextMessage,
    deleteMessage,
    hideMessagesSelected,
    markUnread,
    editMessage,
    forwardMessage,
    replyToMessage,
    setReplyTo,
    clearReplyTo,
    selectionMode,
    selectedIds,
    enterSelection,
    toggleSelect,
    exitSelection,
    pendingFiles,
    currentUserId,
    conversations,
    isSendingMedia,
    isDeletingMessage,
    deletingMessageId,
    isHidingMessages,
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

  const handleToggleSearch = () => {
    setIsSearchOpen(prev => !prev);
  };

  const handleSelectSearchMessage = useCallback((message: ChatMessage) => {
    setFocusMessageId(message.id);
    setIsSearchOpen(false);
  }, []);

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

  const forwardingMessages = useMemo(
    () =>
      forwardMessageIds
        .map(id => messages.find(message => message.id === id))
        .filter((message): message is ChatMessage => Boolean(message)),
    [forwardMessageIds, messages],
  );

  const forwardMessagePreview = useMemo(() => {
    if (!forwardingMessages.length) {
      return null;
    }

    if (forwardingMessages.length === 1) {
      const message = forwardingMessages[0];
      return getMessagePreview(
        message.content,
        message.media ?? [],
        message.isRedirected,
      );
    }

    return `Выбрано сообщений: ${forwardingMessages.length}`;
  }, [forwardingMessages]);

  const handleForwardMessage = useCallback((messageId: string) => {
    setForwardError(null);
    setForwardMessageIds([messageId]);
  }, []);

  const handleForwardSelected = useCallback(() => {
    if (!selectedIds.size) {
      return;
    }

    setForwardError(null);
    setForwardMessageIds([...selectedIds]);
  }, [selectedIds]);

  const handleConfirmForward = useCallback(
    async (peerId: string) => {
      if (!forwardMessageIds.length) {
        return false;
      }

      setForwardError(null);
      const result = await forwardMessage(forwardMessageIds, peerId);

      if (!result.success) {
        setForwardError(result.error ?? 'Не удалось переслать сообщение');
        return false;
      }

      setForwardMessageIds([]);
      setSnackbarOpen(
        true,
        forwardMessageIds.length > 1
          ? 'Сообщения успешно пересланы'
          : 'Сообщение успешно переслано',
        'success',
      );
      return true;
    },
    [forwardMessage, forwardMessageIds, setSnackbarOpen],
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
            width: '100%',
            height: '100%',
            display: 'flex',
            bgcolor: 'white',
            border: '1px solid',
            p: { xs: 2, md: 4 },
            alignItems: 'center',
            borderColor: 'divider',
            justifyContent: 'center',
            borderRadius: { xs: '16px', md: '32px' },
          }}
        >
          <EmptyBlock
            title="Нет диалогов"
            buttonText="На главную"
            buttonOnClick={() => navigate(ROUTES.INDEX)}
          />
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
              isNotes={selectedConversation?.isNotes}
              hasActiveTasks={canAddPhotoReport}
              hasTaskTzMessages={hasTaskTzMessages}
              isSearchOpen={isSearchOpen}
              conversationId={selectedConversationId}
              onSelectSearchMessage={handleSelectSearchMessage}
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
            ) : (
              <ChatConversation
                draft={draft}
                error={error}
                messages={messages}
                unreadDividerMessageId={unreadDividerMessageId}
                pinnedMessages={pinnedMessages}
                isMessagePinned={isMessagePinned}
                onTogglePinMessage={onTogglePinMessage}
                onSend={sendMessage}
                onDeleteMessage={messageId => void deleteMessage(messageId)}
                onEditMessage={editMessage}
                onForwardMessage={handleForwardMessage}
                onReplyMessage={setReplyTo}
                onMarkUnread={messageId => void markUnread(messageId)}
                onEnterSelection={enterSelection}
                onToggleSelect={toggleSelect}
                onExitSelection={exitSelection}
                onHideSelected={() => void hideMessagesSelected()}
                onForwardSelected={handleForwardSelected}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                replyToMessage={replyToMessage}
                onClearReply={clearReplyTo}
                isDeletingMessage={isDeletingMessage}
                deletingMessageId={deletingMessageId}
                isHidingMessages={isHidingMessages}
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
                focusMessageId={focusMessageId}
                onFocusMessageHandled={() => setFocusMessageId(null)}
              />
            )}
          </Stack>
        )}
      </Stack>

      {selectedConversationId && (
        <>
          <ChatSearchPanel
            open={isSearchOpen && isMobile}
            onClose={() => setIsSearchOpen(false)}
            conversationId={selectedConversationId}
            onSelectMessage={handleSelectSearchMessage}
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
            open={forwardMessageIds.length > 0}
            conversations={conversations}
            currentConversationId={selectedConversationId}
            currentPeerId={selectedConversation?.peer?.id}
            messagePreview={forwardMessagePreview}
            isForwarding={
              isForwardingMessage &&
              Boolean(
                forwardingMessageId &&
                  forwardMessageIds.includes(forwardingMessageId),
              )
            }
            error={forwardError}
            onForward={handleConfirmForward}
            onClose={() => {
              if (isForwardingMessage) {
                return;
              }

              setForwardError(null);
              setForwardMessageIds([]);
            }}
          />
        </>
      )}
    </PageLayout>
  );
};

export default ChatPage;
