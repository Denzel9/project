import {
  ChevronLeft,
  ChatOutlined,
  Close,
  FilterList,
  OpenInNewOutlined,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  sortConversationsByUnread,
  useConversationsQuery,
  type ChatConversation,
} from '@/entities/chat';
import { useAuthStore } from '@/features';
import { ChatInput } from '@/pages/chat/ui/ChatInput';
import { ChatMessageBubble } from '@/pages/chat/ui/ChatMessageBubble';
import { ConversationItem } from '@/pages/chat/ui/ConversationItem';
import { EmptyBlock, ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { useDashboardChatThread } from '../model/useDashboardChatThread';

import type { MessageSide } from '@/pages/chat/model/types';

const DASHBOARD_CHATS_LIMIT = 8;

const toMessageSide = (
  senderId: string,
  currentUserId: string | null
): MessageSide =>
  currentUserId && senderId === currentUserId ? 'outgoing' : 'incoming';

export const DashboardChatsPanel = () => {
  const navigate = useNavigate();
  const { id: currentUserId } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();

  const [peerId, setPeerId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [peerOptions, setPeerOptions] = useState<
    { id: string; displayName: string }[]
  >([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef(0);

  const hasActiveFilters = peerId !== 'all' || Boolean(appliedQuery);

  const conversationParams = useMemo(
    () => ({
      ...(appliedQuery && { q: appliedQuery }),
      ...(peerId !== 'all' && { peerId }),
    }),
    [appliedQuery, peerId]
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
          a.displayName.localeCompare(b.displayName, 'ru')
        );
      });
    }, 0);
  }, [allConversations, data]);

  const recentConversations = useMemo(() => {
    const sorted = sortConversationsByUnread(data ?? []);

    return hasActiveFilters ? sorted : sorted.slice(0, DASHBOARD_CHATS_LIMIT);
  }, [data, hasActiveFilters]);

  const selectedPeerTitle = useMemo(
    () => peerOptions.find(peer => peer.id === peerId)?.displayName,
    [peerId, peerOptions]
  );

  const selectedConversation = useMemo(
    () =>
      recentConversations.find(
        conversation => conversation.id === selectedConversationId
      ) ??
      data?.find(conversation => conversation.id === selectedConversationId) ??
      allConversations?.find(
        conversation => conversation.id === selectedConversationId
      ) ??
      null,
    [recentConversations, data, allConversations, selectedConversationId]
  );

  const emptyMessage = useMemo(() => {
    if (appliedQuery) {
      return `Нет чатов по запросу «${appliedQuery}»`;
    }

    if (peerId !== 'all') {
      return 'Нет чатов с выбранным собеседником';
    }

    return 'Пока нет чатов';
  }, [appliedQuery, peerId]);

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
    const timer = window.setTimeout(() => {
      setAppliedQuery(searchQuery.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setTimeout(() => {
      setIsOpenFilter(false);
      setSelectedConversationId(null);
    }, 0);
  }, [peerId, appliedQuery]);

  const openFullChat = (conversation: ChatConversation) => {
    navigate(
      `${ROUTES.CHAT}?recipientId=${encodeURIComponent(conversation.peer.id)}`
    );
  };

  const handleSend = async () => {
    const ok = await sendMessage();

    if (!ok) {
      setSnackbarOpen(true, 'Не удалось отправить сообщение');
    }
  };

  const handleResetFilters = () => {
    setPeerId('all');
    setSearchQuery('');
    setAppliedQuery('');
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
              onClick={() => setSelectedConversationId(null)}
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
            variant="subtitle1"
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
          sx={{ flexShrink: 0 }}
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

          <IconButton
            aria-label="Открыть чаты"
            onClick={() => {
              if (selectedConversation) {
                openFullChat(selectedConversation);
                return;
              }

              navigate(ROUTES.CHAT);
            }}
          >
            <OpenInNewOutlined />
          </IconButton>
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { sm: 'center' } }}
          >
            <TextField
              select
              fullWidth
              size="small"
              label="Собеседник"
              value={peerId}
              onChange={event => setPeerId(event.target.value)}
              sx={{ minWidth: 0 }}
            >
              <MenuItem value="all">Все собеседники</MenuItem>
              {peerOptions.map(peer => (
                <MenuItem
                  key={peer.id}
                  value={peer.id}
                >
                  {peer.displayName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Поиск по чатам"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              sx={{ minWidth: 0 }}
              slotProps={{
                input: {
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Очистить поиск"
                        onClick={() => {
                          setSearchQuery('');
                          setAppliedQuery('');
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Stack>

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

              {appliedQuery && (
                <Chip
                  size="small"
                  label={`Поиск: ${appliedQuery}`}
                  onDelete={() => {
                    setSearchQuery('');
                    setAppliedQuery('');
                  }}
                />
              )}

              <Chip
                size="small"
                label="Сбросить"
                onClick={handleResetFilters}
                sx={{ bgcolor: 'transparent' }}
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
                key={conversation.id}
                conversation={conversation}
                isSelected={false}
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
        </Stack>
      )}
    </Box>
  );
};
