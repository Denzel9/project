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
  draft: string;
  pendingFiles: File[];
  isSending?: boolean;
  onDraftChange: (value: string) => void;
  onAttachFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onSend: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetryError?: () => void;
  onDismissError?: () => void;

  pinnedMessages: ChatMessagePin[];
  isMessagePinned: (messageId: string) => boolean;
  onTogglePinMessage: (messageId: string, nextPinned: boolean) => void;
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
  draft,
  pendingFiles,
  isSending = false,
  onDraftChange,
  onAttachFiles,
  onRemoveFile,
  onSend,
  isLoading = false,
  error = null,
  onRetryError,
  onDismissError,
  pinnedMessages,
  isMessagePinned,
  onTogglePinMessage,
  focusMessageId = null,
  onFocusMessageHandled,
}: ChatConversationProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesContentRef = useRef<HTMLDivElement>(null);
  const prevPeerIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef(0);
  const highlightTimeoutRef = useRef<number | null>(null);
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
    setShowScrollToBottom(!isNearBottom());
  }, [isNearBottom]);

  const handleScrollToBottomClick = useCallback(() => {
    scrollToBottom('smooth');
    setShowScrollToBottom(false);
  }, [scrollToBottom]);

  const handleJumpToMessage = useCallback(
    (messageId: string) => {
      setPinnedDialogOpen(false);

      window.setTimeout(() => {
        const container = messagesContainerRef.current;
        const el = container?.querySelector(
          `[data-message-id="${messageId}"]`,
        ) as HTMLElement | null;

        if (!container || !el) {
          setJumpError('Сообщение не найдено в загруженной истории чата');
          return;
        }

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

        if (highlightTimeoutRef.current) {
          window.clearTimeout(highlightTimeoutRef.current);
        }

        setHighlightedMessageId(messageId);
        highlightTimeoutRef.current = window.setTimeout(() => {
          setHighlightedMessageId(null);
          highlightTimeoutRef.current = null;
        }, 2200);

        setShowScrollToBottom(!isNearBottom());
      }, 0);
    },
    [isNearBottom],
  );

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
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollButtonVisibility();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [peer, messages.length, updateScrollButtonVisibility]);

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

    const peerChanged = prevPeerIdRef.current !== peer.id;
    const messagesAdded = messages.length > prevMessagesLengthRef.current;
    const lastMessage = messages[messages.length - 1];
    const isOwnMessage =
      Boolean(currentUserId) && lastMessage?.senderId === currentUserId;

    prevPeerIdRef.current = peer.id;
    prevMessagesLengthRef.current = messages.length;

    if (peerChanged) {
      scrollToBottom('auto');
      setShowScrollToBottom(false);
      return;
    }

    if (messagesAdded && (isOwnMessage || isNearBottom())) {
      scrollToBottom('smooth');
      setShowScrollToBottom(false);
    }
  }, [peer, messages, isLoading, currentUserId, isNearBottom, scrollToBottom]);

  useEffect(() => {
    const content = messagesContentRef.current;

    if (!content || !peer) return;

    let frameId = 0;

    const observer = new ResizeObserver(() => {
      if (!isNearBottom()) return;

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
  }, [isNearBottom, scrollToBottom, peer]);

  if (!peer) {
    return (
      <Stack
        sx={{
          flex: 1,
          p: 4,
          borderRadius: '32px',
          alignItems: 'center',
          bgcolor: 'common.white',
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
        borderColor: 'divider',
        flex: 1,
        minHeight: 0,
        p: { xs: 2, md: 2 },
        borderRadius: '24px',
        bgcolor: 'common.white',
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
          mb: 2,
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
              // minHeight (not height) so bottom padding sits after the last
              // message when content overflows the scroll area
              minHeight: '100%',
              boxSizing: 'border-box',
              gap: 1.25,
              px: { xs: 1.5, md: 2 },
              pt: { xs: 1.5, md: 2 },
              pb: 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {isLoading && messages.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
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
          </Box>
        </Box>

        {showScrollToBottom && (
          <IconButton
            aria-label="Прокрутить к последнему сообщению"
            onClick={handleScrollToBottomClick}
            sx={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              bgcolor: 'common.white',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: 'common.white',
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

            <ChatInput
              value={draft}
              pendingFiles={pendingFiles}
              isSending={isSending}
              disabled={!peer}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
};
