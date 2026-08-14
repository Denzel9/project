import {
  Assignment,
  AttachFile,
  ChevronLeft,
  ChatOutlined,
  Close,
  FilterList,
  PushPinOutlined,
  Search,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import {
  useConversationsQuery,
  useMarkConversationUnreadMutation,
  useMessagePinsQuery,
  usePinMessageMutation,
  type ChatConversation,
  type ChatMessage,
} from '@/entities';
import { useAuthStore, ChatContactSearch, type ChatFilter } from '@/features';
import { EmptyBlock, ROUTES } from '@/shared';
import {
  ChatAttachmentsPanel,
  ChatInput,
  ChatMessageBubble,
  ChatMessageSearchAutocomplete,
  ChatPinnedMessagesDialog,
  ChatSearchPanel,
  ChatTaskTzPanel,
  ConversationItem,
  extractChatTaskTzMessages,
  getPinnedMessagePreview,
  useChatPeerTasks,
  useSnackbarStore,
} from '@/widgets';

import { useDashboardChatThread } from '../model/useDashboardChatThread';

import type { UserSearchItem } from '@/entities/user';

const DASHBOARD_CHATS_LIMIT = 8;

export const DashboardChatsPanel = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const { id: currentUserId } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();

  const [peerId, setPeerId] = useState('all');
  const [chatFilter, setChatFilter] = useState<ChatFilter>('all');
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isThreadSearchOpen, setIsThreadSearchOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isTaskTzOpen, setIsTaskTzOpen] = useState(false);
  const [pinnedDialogOpen, setPinnedDialogOpen] = useState(false);
  const [peerOptions, setPeerOptions] = useState<
    { id: string; displayName: string }[]
  >([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef(0);

  const hasActiveFilters = peerId !== 'all' || chatFilter !== 'all';

  const conversationParams = useMemo(
    () => ({
      ...(peerId !== 'all' && { peerId }),
    }),
    [peerId],
  );

  const { data, isLoading, isError, refetch } =
    useConversationsQuery(conversationParams);

  const { data: allConversations } = useConversationsQuery(undefined, {
    enabled: isOpenFilter || peerId !== 'all',
  });

  useEffect(() => {
    const source = allConversations ?? data;

    if (!source?.length) return;

    setTimeout(() => {
      setPeerOptions(prev => {
        const map = new Map(prev.map(peer => [peer.id, peer]));

        source.forEach(conversation => {
          map.set(conversation.peer.id, {
            id: conversation.peer.id,
            displayName: conversation.peer.displayName,
          });
        });

        return Array.from(map.values()).sort((a, b) =>
          a.displayName.localeCompare(b.displayName, 'ru'),
        );
      });
    }, 0);
  }, [allConversations, data]);

  const recentConversations = useMemo(() => {
    const sorted = [...(data ?? [])].sort((a: ChatConversation, b: ChatConversation) => {
      const aHasUnread = a.unreadCount > 0 || Boolean(a.isMarkedUnread);
      const bHasUnread = b.unreadCount > 0 || Boolean(b.isMarkedUnread);

      if (aHasUnread !== bHasUnread) {
        return aHasUnread ? -1 : 1;
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const filtered =
      chatFilter === 'unread'
        ? sorted.filter(
          conversation =>
            (conversation.unreadCount ?? 0) > 0 ||
            Boolean(conversation.isMarkedUnread),
        )
        : sorted;

    return hasActiveFilters ? filtered : filtered.slice(0, DASHBOARD_CHATS_LIMIT);
  }, [data, hasActiveFilters, chatFilter]);

  const selectedPeerTitle = useMemo(
    () => peerOptions.find(peer => peer.id === peerId)?.displayName,
    [peerId, peerOptions],
  );

  const selectedConversation = useMemo(
    () =>
      recentConversations.find(
        conversation => conversation.id === selectedConversationId,
      ) ??
      data?.find(conversation => conversation.id === selectedConversationId) ??
      allConversations?.find(
        conversation => conversation.id === selectedConversationId,
      ) ??
      null,
    [recentConversations, data, allConversations, selectedConversationId],
  );

  const emptyMessage = useMemo(() => {
    if (peerId !== 'all') {
      return 'Нет чатов с выбранным собеседником';
    }

    if (chatFilter === 'unread') {
      return 'Нет непрочитанных чатов';
    }

    return 'Пока нет чатов';
  }, [peerId, chatFilter]);

  const {
    messages,
    isLoading: isThreadLoading,
    isError: isThreadError,
    refetch: refetchThread,
    draft,
    setDraft,
    pendingFiles,
    attachFiles,
    removeFile,
    sendMessage,
    isSending,
  } = useDashboardChatThread({ conversationId: selectedConversationId });

  const { data: pinnedMessages = [] } = useMessagePinsQuery(
    selectedConversationId,
  );
  const pinMessageMutation = usePinMessageMutation();
  const markConversationUnread = useMarkConversationUnreadMutation();

  const pinnedMessageIds = useMemo(
    () => new Set(pinnedMessages.map(pin => pin.messageId)),
    [pinnedMessages],
  );

  const pinnedByMessageId = useMemo(() => {
    const map = new Map<string, (typeof pinnedMessages)[number]>();

    pinnedMessages.forEach(pin => {
      map.set(pin.messageId, pin);
    });

    return map;
  }, [pinnedMessages]);

  const handleTogglePinMessage = useCallback(
    (
      messageId: string,
      nextPinned: boolean,
      scope?: 'PERSONAL' | 'SHARED',
    ) => {
      if (!selectedConversationId) return;

      pinMessageMutation.mutate({
        conversationId: selectedConversationId,
        messageId,
        isPinned: nextPinned,
        ...(nextPinned && scope ? { scope } : {}),
      });
    },
    [pinMessageMutation, selectedConversationId],
  );

  const handleMarkUnread = useCallback(
    (messageId: string) => {
      if (!selectedConversationId) return;

      void markConversationUnread
        .mutateAsync({
          conversationId: selectedConversationId,
          messageId,
        })
        .then(() => {
          setSelectedConversationId(null);
        });
    },
    [markConversationUnread, selectedConversationId],
  );

  const handleJumpToPinnedMessage = useCallback((messageId: string) => {
    setPinnedDialogOpen(false);
    setIsThreadSearchOpen(false);

    const container = messagesContainerRef.current;
    const el = container?.querySelector(
      `#dashboard-chat-message-${messageId}`,
    ) as HTMLElement | null;

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleSelectSearchMessage = useCallback(
    (message: ChatMessage) => {
      handleJumpToPinnedMessage(message.id);
    },
    [handleJumpToPinnedMessage],
  );

  const { peerAssignedTasks } = useChatPeerTasks(
    selectedConversation?.peer?.id,
  );

  const hasTaskTzMessages = useMemo(
    () => extractChatTaskTzMessages(messages).length > 0,
    [messages],
  );

  const scrollMessagesToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  useLayoutEffect(() => {
    if (!selectedConversationId || isThreadLoading) return;

    const conversationChanged =
      prevConversationIdRef.current !== selectedConversationId;
    const messagesAdded = messages.length > prevMessagesLengthRef.current;

    prevConversationIdRef.current = selectedConversationId;
    prevMessagesLengthRef.current = messages.length;

    if (conversationChanged) {
      scrollMessagesToBottom('auto');
      return;
    }

    if (messagesAdded) {
      scrollMessagesToBottom('smooth');
    }
  }, [selectedConversationId, isThreadLoading, messages]);

  useEffect(() => {
    if (selectedConversationId) return;

    prevConversationIdRef.current = null;
    prevMessagesLengthRef.current = 0;
  }, [selectedConversationId]);

  useEffect(() => {
    setTimeout(() => {
      setIsOpenFilter(false);
      setSelectedConversationId(null);
    }, 0);
  }, [peerId]);

  useEffect(() => {
    setTimeout(() => {
      setIsThreadSearchOpen(false);
      setIsAttachmentsOpen(false);
      setIsTaskTzOpen(false);
      setPinnedDialogOpen(false);
    }, 0);
  }, [selectedConversationId]);

  const handleSend = async () => {
    const ok = await sendMessage();

    if (!ok) {
      setSnackbarOpen(true, 'Не удалось отправить сообщение');
    }
  };

  const handleResetFilters = () => {
    setPeerId('all');
    setChatFilter('all');
  };

  const handleSelectContact = (user: UserSearchItem) => {
    const existing =
      data?.find(conversation => conversation.peer.id === user.id) ??
      allConversations?.find(conversation => conversation.peer.id === user.id);

    if (existing) {
      setSelectedConversationId(existing.id);
      setIsOpenFilter(false);
      return;
    }

    navigate(`${ROUTES.CHATS}?recipientId=${user.id}`);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  const handleToggleThreadSearch = () => {
    setIsThreadSearchOpen(prev => !prev);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '600px',
        display: 'flex',
        bgcolor: 'white',
        overflow: 'hidden',
        border: '1px solid',
        borderRadius: '24px',
        p: 2,
        borderColor: 'divider',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}
        >
          {selectedConversation ? (
            <IconButton
              size="small"
              aria-label="К списку чатов"
              onClick={handleBackToList}
            >
              <ChevronLeft />
            </IconButton>
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: 'flex',
                borderRadius: '12px',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'secondary.light',
                color: 'primary.main',
              }}
            >
              <ChatOutlined fontSize="small" />
            </Box>
          )}

          <Typography
            variant={selectedConversation ? "subtitle1" : "h6"}
            noWrap
            sx={{ fontWeight: 600 }}
          >
            {selectedConversation
              ? selectedConversation.peer.displayName
              : 'Чаты'}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.25}
          sx={{ flexShrink: 0, alignItems: 'center' }}
        >
          {!selectedConversation && (
            <IconButton
              onClick={() => setIsOpenFilter(prev => !prev)}
              sx={{
                color: hasActiveFilters ? 'primary.main' : 'text.secondary',
              }}
            >
              <FilterList />
            </IconButton>
          )}

          {selectedConversation && (
            <>
              {isThreadSearchOpen && !isMobile && (
                <ChatMessageSearchAutocomplete
                  autoFocus
                  conversationId={selectedConversationId}
                  sx={{ width: 220 }}
                  onSelect={handleSelectSearchMessage}
                />
              )}

              <Tooltip title="Поиск по сообщениям">
                <IconButton
                  aria-label="Поиск по сообщениям"
                  onClick={handleToggleThreadSearch}
                >
                  {isThreadSearchOpen ? <Close /> : <Search />}
                </IconButton>
              </Tooltip>

              {hasTaskTzMessages && (
                <Tooltip title="Технические задания">
                  <IconButton
                    aria-label="Технические задания"
                    onClick={() => setIsTaskTzOpen(true)}
                  >
                    <Assignment />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Вложения">
                <IconButton
                  aria-label="Вложения"
                  onClick={() => setIsAttachmentsOpen(true)}
                >
                  <AttachFile />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Stack>

      {!selectedConversation && isOpenFilter && (
        <Box
          sx={{
            mb: 1.5,
            p: 1.25,
            flexShrink: 0,
            borderRadius: '16px',
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ChatContactSearch
            size="small"
            filter={chatFilter}
            onFilterChange={setChatFilter}
            onSelect={handleSelectContact}
          />

          {hasActiveFilters && (
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ mt: 1.25, flexWrap: 'wrap', gap: 0.75 }}
            >
              {peerId !== 'all' && selectedPeerTitle && (
                <Chip
                  size="small"
                  label={selectedPeerTitle}
                  onDelete={() => setPeerId('all')}
                />
              )}

              {chatFilter === 'unread' && (
                <Chip
                  size="small"
                  label="Непрочитано"
                  onDelete={() => setChatFilter('all')}
                />
              )}

              <Chip
                label="Сбросить"
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ flexShrink: 0 }}
              />
            </Stack>
          )}
        </Box>
      )}

      {!selectedConversation && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 6,
              }}
            >
              <CircularProgress size={28} />
            </Box>
          )}

          {!isLoading && isError && (
            <EmptyBlock
              sx={{ height: '100%' }}
              title="Не удалось загрузить чаты"
              description="Попробуйте ещё раз"
              buttonText="Повторить"
              navigate={() => void refetch()}
            />
          )}

          {!isLoading && !isError && recentConversations.length === 0 && (
            <EmptyBlock
              sx={{ height: '100%' }}
              title={emptyMessage}
              description={
                hasActiveFilters
                  ? 'Измените или сбросьте фильтры'
                  : 'Начните переписку в мессенджере'
              }
              buttonText={hasActiveFilters ? 'Сбросить' : 'Открыть мессенджер'}
              navigate={
                hasActiveFilters
                  ? handleResetFilters
                  : () => navigate(ROUTES.CHATS)
              }
            />
          )}

          {!isLoading &&
            !isError &&
            recentConversations.map(conversation => (
              <ConversationItem
                isSelected={false}
                key={conversation.id}
                conversation={conversation}
                onSelect={() => setSelectedConversationId(conversation.id)}
              />
            ))}
        </Box>
      )}

      {selectedConversation && (
        <Stack
          spacing={1.5}
          sx={{ flex: 1, minHeight: 0 }}
        >
          <Box
            ref={messagesContainerRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              pr: 0.5,
            }}
          >
            {pinnedMessages.length > 0 && (
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  px: 1.5,
                  py: 1.25,
                  mb: 1,
                  bgcolor: 'common.white',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '16px',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      Закреплённые · {pinnedMessages.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                      }}
                    >
                      {getPinnedMessagePreview(pinnedMessages[0])}
                    </Typography>
                  </Box>

                  <Tooltip title="Посмотреть закреплённые">
                    <IconButton
                      size="small"
                      aria-label="Посмотреть закреплённые"
                      onClick={() => setPinnedDialogOpen(true)}
                      sx={{
                        flexShrink: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <PushPinOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}

            {isThreadLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 6,
                }}
              >
                <CircularProgress size={28} />
              </Box>
            )}

            {!isThreadLoading && isThreadError && (
              <EmptyBlock
                sx={{ height: '100%' }}
                title="Не удалось загрузить сообщения"
                description="Попробуйте ещё раз"
                buttonText="Повторить"
                navigate={() => void refetchThread()}
              />
            )}

            {!isThreadLoading && !isThreadError && messages.length === 0 && (
              <Box
                sx={{
                  py: 4,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Напишите первое сообщение ниже
                </Typography>
              </Box>
            )}

            {!isThreadLoading &&
              !isThreadError &&
              messages.map(message => (
                <Box
                  key={message.id}
                  id={`dashboard-chat-message-${message.id}`}
                  sx={{ mb: 1 }}
                >
                  <ChatMessageBubble
                    message={message}
                    currentUserId={currentUserId}
                    senderAvatar={selectedConversation.peer.avatar}
                    senderName={selectedConversation.peer.displayName}
                    isPinned={pinnedMessageIds.has(message.id)}
                    canUnpin={
                      pinnedByMessageId.get(message.id)?.pinnedById ===
                      currentUserId
                    }
                    onPin={handleTogglePinMessage}
                    onMarkUnread={handleMarkUnread}
                  />
                </Box>
              ))}
          </Box>

          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={() => void handleSend()}
            pendingFiles={pendingFiles}
            onAttachFiles={attachFiles}
            onRemoveFile={removeFile}
            isSending={isSending}
            placeholder="Написать сообщение…"
          />

          <ChatPinnedMessagesDialog
            open={pinnedDialogOpen}
            pinnedMessages={pinnedMessages}
            onClose={() => setPinnedDialogOpen(false)}
            onSelect={handleJumpToPinnedMessage}
          />
        </Stack>
      )}

      {selectedConversationId && (
        <>
          <ChatSearchPanel
            open={isThreadSearchOpen && isMobile}
            onClose={() => setIsThreadSearchOpen(false)}
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
        </>
      )}
    </Box>
  );
};
