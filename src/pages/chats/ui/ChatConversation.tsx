import { ChatOutlined, Close, KeyboardArrowDown } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  formatChatDaySeparatorLabel,
  isSameChatDay,
} from '@/entities/chat';
import { EmptyBlock } from '@/shared';
import {
  ChatInput,
  ChatMessageBubble,
  ChatPinnedMessagesDialog,
  ChatPinnedMessagesHeader,
} from '@/widgets/chat';

import { ChatDaySeparator } from './ChatDaySeparator';
import { ChatErrorBanner } from './ChatErrorBanner';
import { ChatSelectionBar } from './ChatSelectionBar';
import { UnreadMessagesDivider } from './UnreadMessagesDivider';

import type { ChatMessage, ChatMessagePin, ChatPeer } from '@/entities/chat';

const SCROLL_LOAD_THRESHOLD_PX = 80;

type ChatConversationProps = {
  messages: ChatMessage[];
  unreadDividerMessageId?: string | null;
  currentUserId: string | null;
  onDeleteMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, content: string) => Promise<boolean>;
  onForwardMessage?: (messageId: string) => void;
  onReplyMessage?: (message: ChatMessage) => void;
  onMarkUnread?: (messageId: string) => void;
  onEnterSelection?: (messageId?: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onExitSelection?: () => void;
  onHideSelected?: () => void;
  onForwardSelected?: () => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  replyToMessage?: ChatMessage | null;
  onClearReply?: () => void;
  isDeletingMessage?: boolean;
  deletingMessageId?: string | null;
  isHidingMessages?: boolean;
  isEditingMessage?: boolean;
  editingMessageId?: string | null;
  peer?: ChatPeer | null;
  canSendMessages?: boolean;
  sendBlockedReason?: string | null;
  draft: string;
  pendingFiles: File[];
  isSending?: boolean;
  onDraftChange: (value: string) => void;
  onAttachFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onSend: () => void;
  isLoading?: boolean;
  hasOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void | Promise<unknown>;
  hasNewer?: boolean;
  isLoadingNewer?: boolean;
  onLoadNewer?: () => void | Promise<unknown>;
  onEnsureMessage?: (messageId: string) => Promise<boolean>;
  onResetToTail?: () => void | Promise<unknown>;
  error?: string | null;
  onRetryError?: () => void;
  onDismissError?: () => void;

  pinnedMessages: ChatMessagePin[];
  isMessagePinned: (messageId: string) => boolean;
  getMessagePinScope: (messageId: string) => 'PERSONAL' | 'SHARED' | null;
  canUnpinMessage: (messageId: string) => boolean;
  onTogglePinMessage: (
    messageId: string,
    nextPinned: boolean,
    scope?: 'PERSONAL' | 'SHARED',
  ) => void;
  focusMessageId?: string | null;
  onFocusMessageHandled?: () => void;
};

export const ChatConversation = ({
  messages,
  unreadDividerMessageId = null,
  currentUserId,
  onDeleteMessage,
  onEditMessage,
  onForwardMessage,
  onReplyMessage,
  onMarkUnread,
  onEnterSelection,
  onToggleSelect,
  onExitSelection,
  onHideSelected,
  onForwardSelected,
  selectionMode = false,
  selectedIds,
  replyToMessage = null,
  onClearReply,
  isDeletingMessage = false,
  deletingMessageId = null,
  isHidingMessages = false,
  isEditingMessage = false,
  editingMessageId = null,
  peer,
  canSendMessages = true,
  sendBlockedReason = null,
  draft,
  pendingFiles,
  isSending = false,
  onDraftChange,
  onAttachFiles,
  onRemoveFile,
  onSend,
  isLoading = false,
  hasOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
  hasNewer = false,
  isLoadingNewer = false,
  onLoadNewer,
  onEnsureMessage,
  onResetToTail,
  error = null,
  onRetryError,
  onDismissError,
  pinnedMessages,
  isMessagePinned,
  getMessagePinScope,
  canUnpinMessage,
  onTogglePinMessage,
  focusMessageId = null,
  onFocusMessageHandled,
}: ChatConversationProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesContentRef = useRef<HTMLDivElement>(null);
  const prevPeerIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef(0);
  const highlightTimeoutRef = useRef<number | null>(null);
  const scrollRestoreHeightRef = useRef<number | null>(null);
  const skipAutoScrollRef = useRef(false);
  const pendingJumpIdRef = useRef<string | null>(null);
  const pendingScrollToBottomRef = useRef(false);
  const [jumpRequestId, setJumpRequestId] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [pinnedDialogOpen, setPinnedDialogOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(
    null,
  );
  const [jumpError, setJumpError] = useState<string | null>(null);

  const selectedCount = selectedIds?.size ?? 0;

  const messageDayStarts = useMemo(() => {
    const starts = new Set<string>();

    messages.forEach((message, index) => {
      if (
        index === 0 ||
        !isSameChatDay(message.createdAt, messages[index - 1].createdAt)
      ) {
        starts.add(message.id);
      }
    });

    return starts;
  }, [messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;

    if (!container) return true;

    const threshold = 80;

    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  }, []);

  const updateScrollButtonVisibility = useCallback(() => {
    setShowScrollToBottom(!isNearBottom() || hasNewer);
  }, [hasNewer, isNearBottom]);

  const handleLoadOlder = useCallback(() => {
    const container = messagesContainerRef.current;

    if (
      !container ||
      isLoadingOlder ||
      !hasOlder ||
      !onLoadOlder ||
      pendingJumpIdRef.current
    ) {
      return;
    }

    scrollRestoreHeightRef.current = container.scrollHeight;
    skipAutoScrollRef.current = true;
    void onLoadOlder();
  }, [hasOlder, isLoadingOlder, onLoadOlder]);

  const handleLoadNewer = useCallback(() => {
    if (
      isLoadingNewer ||
      !hasNewer ||
      !onLoadNewer ||
      pendingJumpIdRef.current
    ) {
      return;
    }

    skipAutoScrollRef.current = true;
    void onLoadNewer();
  }, [hasNewer, isLoadingNewer, onLoadNewer]);

  const handleScrollToBottomClick = useCallback(() => {
    const jumpToTail = hasNewer && onResetToTail;

    if (jumpToTail) {
      pendingScrollToBottomRef.current = true;
      skipAutoScrollRef.current = false;
      void Promise.resolve(onResetToTail()).catch(() => {
        pendingScrollToBottomRef.current = false;
      });
      return;
    }

    scrollToBottom('smooth');
    setShowScrollToBottom(false);
  }, [hasNewer, onResetToTail, scrollToBottom]);

  const handleJumpToMessage = useCallback(
    (messageId: string) => {
      setPinnedDialogOpen(false);
      setJumpError(null);
      pendingJumpIdRef.current = messageId;
      skipAutoScrollRef.current = true;

      const container = messagesContainerRef.current;
      const el = container?.querySelector(
        `[data-message-id="${messageId}"]`,
      ) as HTMLElement | null;

      if (el) {
        setJumpRequestId(value => value + 1);
        return;
      }

      if (!onEnsureMessage) {
        pendingJumpIdRef.current = null;
        skipAutoScrollRef.current = false;
        setJumpError('Сообщение не найдено в загруженной истории чата');
        return;
      }

      void onEnsureMessage(messageId).then(found => {
        if (!found) {
          pendingJumpIdRef.current = null;
          skipAutoScrollRef.current = false;
          setJumpError('Сообщение не найдено');
          return;
        }

        setJumpRequestId(value => value + 1);
      });
    },
    [onEnsureMessage],
  );

  const highlightMessage = useCallback((messageId: string) => {
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    setHighlightedMessageId(messageId);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedMessageId(null);
      highlightTimeoutRef.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    if (!focusMessageId) return;
    setTimeout(() => {
      handleJumpToMessage(focusMessageId);
    }, 0);
    onFocusMessageHandled?.();
  }, [focusMessageId, handleJumpToMessage, onFocusMessageHandled]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!peer) {
      pendingJumpIdRef.current = null;
      pendingScrollToBottomRef.current = false;
      setTimeout(() => {
        setShowScrollToBottom(false);
        setHighlightedMessageId(null);
      }, 0);
      return;
    }

    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      updateScrollButtonVisibility();

      if (container.scrollTop <= SCROLL_LOAD_THRESHOLD_PX) {
        handleLoadOlder();
      }

      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      if (distanceToBottom <= SCROLL_LOAD_THRESHOLD_PX) {
        handleLoadNewer();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollButtonVisibility();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [peer, messages.length, updateScrollButtonVisibility, handleLoadOlder, handleLoadNewer]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (
      !container ||
      !hasOlder ||
      isLoadingOlder ||
      isLoading ||
      messages.length === 0
    ) {
      return;
    }

    if (container.scrollHeight <= container.clientHeight + SCROLL_LOAD_THRESHOLD_PX) {
      handleLoadOlder();
    }
  }, [
    handleLoadOlder,
    hasOlder,
    isLoading,
    isLoadingOlder,
    messages.length,
  ]);

  useEffect(() => {
    if (!peer) {
      prevPeerIdRef.current = null;
      prevMessagesLengthRef.current = 0;
      return;
    }

    if (prevPeerIdRef.current !== peer.id) {
      prevMessagesLengthRef.current = 0;
      prevPeerIdRef.current = null;
    }
  }, [peer]);

  useLayoutEffect(() => {
    if (!peer || isLoading || messages.length === 0) return;

    const container = messagesContainerRef.current;
    const previousHeight = scrollRestoreHeightRef.current;

    if (container && previousHeight != null && !isLoadingOlder) {
      container.scrollTop = container.scrollHeight - previousHeight;
      scrollRestoreHeightRef.current = null;
      skipAutoScrollRef.current = false;
      prevPeerIdRef.current = peer.id;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    if (pendingScrollToBottomRef.current && !isLoading) {
      pendingScrollToBottomRef.current = false;
      skipAutoScrollRef.current = false;
      prevPeerIdRef.current = peer.id;
      prevMessagesLengthRef.current = messages.length;
      scrollToBottom('auto');
      setShowScrollToBottom(false);
      return;
    }

    const peerChanged = prevPeerIdRef.current !== peer.id;
    const messagesAdded = messages.length > prevMessagesLengthRef.current;
    const lastMessage = messages[messages.length - 1];
    const isOwnMessage =
      Boolean(currentUserId) && lastMessage?.senderId === currentUserId;

    prevPeerIdRef.current = peer.id;
    prevMessagesLengthRef.current = messages.length;

    if (skipAutoScrollRef.current) {
      return;
    }

    if (peerChanged) {
      scrollToBottom('auto');
      setShowScrollToBottom(false);
      return;
    }

    if (messagesAdded && !hasNewer && (isOwnMessage || isNearBottom())) {
      scrollToBottom('smooth');
      setShowScrollToBottom(false);
    }
  }, [
    peer,
    messages,
    isLoading,
    isLoadingOlder,
    hasNewer,
    currentUserId,
    isNearBottom,
    scrollToBottom,
  ]);

  useLayoutEffect(() => {
    const messageId = pendingJumpIdRef.current;

    if (!messageId) return;

    const container = messagesContainerRef.current;
    const el = container?.querySelector(
      `[data-message-id="${messageId}"]`,
    ) as HTMLElement | null;

    if (!container || !el) return;

    pendingJumpIdRef.current = null;
    skipAutoScrollRef.current = false;

    const stickyHeader = container.querySelector(
      '[data-pinned-header="true"]',
    ) as HTMLElement | null;
    const stickyOffset = stickyHeader?.offsetHeight ?? 0;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetTop =
      container.scrollTop +
      (elRect.top - containerRect.top) -
      stickyOffset -
      container.clientHeight / 3;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });

    highlightMessage(messageId);
    setShowScrollToBottom(!isNearBottom() || hasNewer);
  }, [hasNewer, highlightMessage, isNearBottom, jumpRequestId, messages]);

  useEffect(() => {
    const content = messagesContentRef.current;

    if (!content || !peer) return;

    let frameId = 0;

    const observer = new ResizeObserver(() => {
      if (skipAutoScrollRef.current || hasNewer || !isNearBottom()) return;

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        scrollToBottom('auto');
      });
    });

    observer.observe(content);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [hasNewer, isNearBottom, scrollToBottom, peer]);

  if (!peer) {
    return (
      <Stack
        sx={{
          flex: 1,
          p: 4,
          borderRadius: '32px',
          alignItems: 'center',
          bgcolor: 'background.paper',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="body1"
          color="text.secondary"
        >
          Выберите диалог из списка слева
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="column"
      sx={{
        border: '1px solid',
        borderBottom: theme => ({ xs: 'none', md: `1px solid ${theme.palette.divider}` }),
        borderLeft: theme => ({ xs: 'none', md: `1px solid ${theme.palette.divider}` }),
        borderRight: theme => ({ xs: 'none', md: `1px solid ${theme.palette.divider}` }),
        borderColor: 'divider',

        flex: 1,
        minHeight: 0,
        p: { xs: 2, md: 2 },
        borderRadius: '24px',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {error && (
        <ChatErrorBanner
          message={error}
          onRetry={onRetryError}
          onDismiss={onDismissError}
        />
      )}

      <Box
        sx={{
          position: 'relative',
          mb: 2.5,
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box
          ref={messagesContainerRef}
          sx={{
            height: '100%',
            display: 'flex',
            overflowY: 'scroll',
            overflowX: 'visible',
            borderRadius: '24px',
            scrollbarWidth: 'none',
            flexDirection: 'column',
            bgcolor: 'secondary.light',
          }}
        >
          <ChatPinnedMessagesHeader
            pinnedMessages={pinnedMessages}
            onJumpToMessage={handleJumpToMessage}
            onOpenAll={() => setPinnedDialogOpen(true)}
          />

          <Box
            ref={messagesContentRef}
            sx={{
              minHeight: '100%',
              boxSizing: 'border-box',
              gap: 1.25,
              px: { xs: 1.5, md: 2 },
              pt: { xs: 1.5, md: 2 },
              pb: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {isLoading && messages.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            )}

            {isLoadingOlder && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                <CircularProgress size={20} />
              </Box>
            )}

            {!isLoading && messages.length === 0 && (
              <EmptyBlock sx={{ height: '100%', flex: 1 }} title="Сообщений пока нет" description="Отправьте первое сообщение" icon={<ChatOutlined sx={{ fontSize: 56, color: 'text.disabled' }} />} />
            )}

            {messages.map(message => (
              <Box
                key={message.id}
                id={`chat-message-${message.id}`}
                data-message-id={message.id}
                sx={{
                  width: '100%',
                  borderRadius: '16px',
                  transition:
                    'background-color 200ms ease, box-shadow 200ms ease',
                }}
              >
                {messageDayStarts.has(message.id) && (
                  <ChatDaySeparator
                    label={formatChatDaySeparatorLabel(message.createdAt)}
                  />
                )}

                {unreadDividerMessageId === message.id && (
                  <UnreadMessagesDivider />
                )}

                <ChatMessageBubble
                  message={message}
                  currentUserId={currentUserId}
                  senderAvatar={peer?.avatar}
                  senderName={peer?.displayName}
                  isPinned={isMessagePinned(message.id)}
                  pinScope={getMessagePinScope(message.id)}
                  canUnpin={canUnpinMessage(message.id)}
                  onPin={onTogglePinMessage}
                  onDelete={onDeleteMessage}
                  onEdit={onEditMessage}
                  onForward={onForwardMessage}
                  onReply={onReplyMessage}
                  onMarkUnread={onMarkUnread}
                  onEnterSelection={onEnterSelection}
                  onReplyJump={handleJumpToMessage}
                  selectionMode={selectionMode}
                  selected={selectedIds?.has(message.id) ?? false}
                  onToggleSelect={onToggleSelect}
                  isDeleting={
                    isDeletingMessage && deletingMessageId === message.id
                  }
                  isEditing={
                    isEditingMessage && editingMessageId === message.id
                  }
                  isHighlighted={highlightedMessageId === message.id}
                />
              </Box>
            ))}

            {isLoadingNewer && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                <CircularProgress size={20} />
              </Box>
            )}

            {messages.length > 0 && (
              <Box
                aria-hidden
                sx={{ flexShrink: 0, height: { xs: 40, md: 32 } }}
              />
            )}
          </Box>
        </Box>

        {showScrollToBottom && (
          <IconButton
            aria-label="К последним сообщениям"
            onClick={handleScrollToBottomClick}
            sx={{
              zIndex: 100,
              position: 'absolute',
              right: 16,
              bottom: 16,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <KeyboardArrowDown />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        {selectionMode ? (
          <ChatSelectionBar
            selectedCount={selectedCount}
            isDeleting={isHidingMessages}
            onClose={() => onExitSelection?.()}
            onDelete={() => onHideSelected?.()}
            onForward={() => onForwardSelected?.()}
          />
        ) : (
          <Stack spacing={1}>
            {replyToMessage && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  px: 1.5,
                  py: 1,
                  borderRadius: '16px',
                  bgcolor: 'secondary.light',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    width: 3,
                    alignSelf: 'stretch',
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: 'primary.main', display: 'block' }}
                  >
                    {replyToMessage.actorDisplayName ||
                      (replyToMessage.senderId === currentUserId
                        ? 'Вы'
                        : peer.displayName)}
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    color="text.secondary"
                  >
                    {replyToMessage.content.trim() ||
                      (replyToMessage.media?.length ? 'Медиа' : 'Сообщение')}
                  </Typography>
                </Box>
                <IconButton
                  aria-label="Отменить ответ"
                  size="small"
                  onClick={onClearReply}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Stack>
            )}

            {!canSendMessages && sendBlockedReason && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 0.5, pb: 0.5 }}
              >
                {sendBlockedReason}
              </Typography>
            )}

            <ChatInput
              value={draft}
              pendingFiles={pendingFiles}
              isSending={isSending}
              disabled={!peer || !canSendMessages}
              placeholder={
                !canSendMessages && sendBlockedReason
                  ? sendBlockedReason
                  : undefined
              }
              onChange={onDraftChange}
              onAttachFiles={onAttachFiles}
              onRemoveFile={onRemoveFile}
              onSend={onSend}
            />
          </Stack>
        )}
      </Box>

      <ChatPinnedMessagesDialog
        open={pinnedDialogOpen}
        pinnedMessages={pinnedMessages}
        onClose={() => setPinnedDialogOpen(false)}
        onSelect={handleJumpToMessage}
      />

      <Snackbar
        open={Boolean(jumpError)}
        autoHideDuration={3000}
        onClose={() => setJumpError(null)}
        message={jumpError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Stack>
  );
};
