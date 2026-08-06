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
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
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
  useMessagePinsQuery,
  useSearchMessagesQuery,
  type ChatConversation,
  type ChatMessage,
  type ChatMessagePin,
} from '@/entities/chat';
import { useAuthStore } from '@/features';
import { ChatContactSearch } from '@/features/chat';
import { extractChatTaskTzMessages } from '@/pages/chat/model/chatTaskTzMessages';
import { useChatPeerTasks } from '@/pages/chat/model/hooks/useChatPeerTasks';
import { ChatAttachmentsPanel } from '@/pages/chat/ui/ChatAttachmentsPanel';
import { ChatInput } from '@/pages/chat/ui/ChatInput';
import { ChatMessageBubble } from '@/pages/chat/ui/ChatMessageBubble';
import { ChatSearchPanel } from '@/pages/chat/ui/ChatSearchPanel';
import { ChatTaskTzPanel } from '@/pages/chat/ui/ChatTaskTzPanel';
import { ConversationItem } from '@/pages/chat/ui/ConversationItem';
import { EmptyBlock, ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { useDashboardChatThread } from '../model/useDashboardChatThread';

import type { UserSearchItem } from '@/entities/user';
import type { MessageSide } from '@/pages/chat/model/types';

const DASHBOARD_CHATS_LIMIT = 8;

const toMessageSide = (
  senderId: string,
  currentUserId: string | null,
): MessageSide =>
  currentUserId && senderId === currentUserId ? 'outgoing' : 'incoming';

export const DashboardChatsPanel = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const { id: currentUserId } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();

  const [peerId, setPeerId] = useState('all');
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isThreadSearchOpen, setIsThreadSearchOpen] = useState(false);
  const [threadSearchQuery, setThreadSearchQuery] = useState('');
  const [debouncedThreadQuery, setDebouncedThreadQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchItems, setSearchItems] = useState<ChatMessage[]>([]);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isTaskTzOpen, setIsTaskTzOpen] = useState(false);
  const [pinnedDialogOpen, setPinnedDialogOpen] = useState(false);
  const [peerOptions, setPeerOptions] = useState<
    { id: string; displayName: string }[]
  >([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef(0);

  const hasActiveFilters = peerId !== 'all';
  const isDesktopSearch = isThreadSearchOpen && !isMobile;

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
      const aHasUnread = a.unreadCount > 0;
      const bHasUnread = b.unreadCount > 0;

      if (aHasUnread !== bHasUnread) {
        return aHasUnread ? -1 : 1;
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return hasActiveFilters ? sorted : sorted.slice(0, DASHBOARD_CHATS_LIMIT);
  }, [data, hasActiveFilters]);

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

    return 'Пока нет чатов';
  }, [peerId]);

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

  const getPinPreview = useCallback((pin: ChatMessagePin) => {
    const trimmed = pin.content.trim();

    if (trimmed) {
      const max = 80;
      return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
    }

    return `Медиа (${pin.mediaCount})`;
  }, []);

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

  const { peerAssignedTasks } = useChatPeerTasks(
    selectedConversation?.peer?.id,
  );

  const hasTaskTzMessages = useMemo(
    () => extractChatTaskTzMessages(messages).length > 0,
    [messages],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedThreadQuery(threadSearchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [threadSearchQuery]);

  useEffect(() => {
    if (!isDesktopSearch) {
      setTimeout(() => {
        setDebouncedThreadQuery('');
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
  }, [debouncedThreadQuery, selectedConversationId]);

  const canSearch =
    isDesktopSearch &&
    Boolean(selectedConversationId) &&
    debouncedThreadQuery.length >= 2;

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    error: searchError,
  } = useSearchMessagesQuery(canSearch ? selectedConversationId : null, {
    q: debouncedThreadQuery,
    page: searchPage,
    limit: 20,
  });

  useEffect(() => {
    if (!canSearch || !searchData) return;

    setTimeout(() => {
      setSearchItems(prev =>
        searchPage === 1 ? searchData.items : [...prev, ...searchData.items],
      );
    }, 0);
  }, [canSearch, searchData, searchPage]);

  const searchHasMore = Boolean(
    searchData && searchData.page * searchData.limit < searchData.total,
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
    if (!selectedConversationId || isThreadLoading || isDesktopSearch) return;

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
  }, [selectedConversationId, isThreadLoading, messages, isDesktopSearch]);

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
      setThreadSearchQuery('');
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

    navigate(`${ROUTES.CHAT}?recipientId=${user.id}`);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  const handleToggleThreadSearch = () => {
    if (isThreadSearchOpen) {
      setIsThreadSearchOpen(false);
      setThreadSearchQuery('');
      return;
    }

    setIsThreadSearchOpen(true);
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
        borderRadius: '32px',
        p: { xs: 2, md: 2.5 },
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
                <TextField
                  autoFocus
                  size="small"
                  label="Поиск"
                  value={threadSearchQuery}
                  onChange={event => setThreadSearchQuery(event.target.value)}
                  sx={{ width: 180 }}
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
              title="Не удалось загрузить чаты"
              description="Попробуйте ещё раз"
              buttonText="Повторить"
              navigate={() => void refetch()}
            />
          )}

          {!isLoading && !isError && recentConversations.length === 0 && (
            <EmptyBlock
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
                  : () => navigate(ROUTES.CHAT)
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
                showActions={false}
                showPinIcon={false}
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
            {!isDesktopSearch && pinnedMessages.length > 0 && (
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
                      {getPinPreview(pinnedMessages[0])}
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

            {isDesktopSearch ? (
              <>
                {isSearchLoading && searchItems.length === 0 && (
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

                {searchError && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ textAlign: 'center', py: 2 }}
                  >
                    Не удалось выполнить поиск
                  </Typography>
                )}

                {!isSearchLoading &&
                  !searchError &&
                  debouncedThreadQuery.length >= 2 &&
                  searchItems.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: 'center', py: 4 }}
                    >
                      Ничего не найдено
                    </Typography>
                  )}

                {debouncedThreadQuery.length < 2 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    Введите минимум 2 символа для поиска
                  </Typography>
                )}

                {searchItems.map(message => (
                  <Box
                    key={message.id}
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 0.5, display: 'block' }}
                    >
                      {format(
                        new Date(message.createdAt),
                        'dd.MM.yyyy HH:mm',
                      )}
                    </Typography>
                    <ChatMessageBubble
                      messageId={message.id}
                      senderId={message.senderId}
                      createdAt={message.createdAt}
                      editedAt={message.editedAt}
                      isRedirected={message.isRedirected}
                      currentUserId={currentUserId}
                      text={message.content}
                      media={message.media}
                      highlight={debouncedThreadQuery}
                      side={toMessageSide(message.senderId, currentUserId)}
                      time={format(new Date(message.createdAt), 'HH:mm')}
                      isRead={message.isRead}
                    />
                  </Box>
                ))}

                {searchHasMore && (
                  <Box
                    sx={{
                      pt: 1,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={isSearchFetching}
                      onClick={() => setSearchPage(prev => prev + 1)}
                    >
                      {isSearchFetching ? 'Загрузка…' : 'Загрузить ещё'}
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <>
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
                    title="Не удалось загрузить сообщения"
                    description="Попробуйте ещё раз"
                    buttonText="Повторить"
                    navigate={() => void refetchThread()}
                  />
                )}

                {!isThreadLoading &&
                  !isThreadError &&
                  messages.length === 0 && (
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
                        messageId={message.id}
                        senderId={message.senderId}
                        createdAt={message.createdAt}
                        editedAt={message.editedAt}
                        isRedirected={message.isRedirected}
                        currentUserId={currentUserId}
                        text={message.content}
                        media={message.media}
                        side={toMessageSide(message.senderId, currentUserId)}
                        time={format(new Date(message.createdAt), 'HH:mm')}
                        isRead={message.isRead}
                      />
                    </Box>
                  ))}
              </>
            )}
          </Box>

          {!isDesktopSearch && (
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
          )}

          <Dialog
            open={pinnedDialogOpen}
            onClose={() => setPinnedDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Закреплённые сообщения</DialogTitle>
            <DialogContent>
              {pinnedMessages.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2 }}
                >
                  Нет закреплённых сообщений
                </Typography>
              ) : (
                <List disablePadding>
                  {pinnedMessages.map(pin => (
                    <Box key={pin.messageId}>
                      <ListItemButton
                        onClick={() => handleJumpToPinnedMessage(pin.messageId)}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: 600,
                              }}
                            >
                              {getPinPreview(pin)}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {format(new Date(pin.pinnedAt), 'dd.MM HH:mm')}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                      <Divider />
                    </Box>
                  ))}
                </List>
              )}
            </DialogContent>
          </Dialog>
        </Stack>
      )}

      {selectedConversationId && (
        <>
          <ChatSearchPanel
            open={isThreadSearchOpen && isMobile}
            query={threadSearchQuery}
            onQueryChange={setThreadSearchQuery}
            currentUserId={currentUserId}
            onClose={() => {
              setIsThreadSearchOpen(false);
              setThreadSearchQuery('');
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
        </>
      )}
    </Box>
  );
};
