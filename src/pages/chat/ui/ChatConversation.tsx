import { ChatOutlined, KeyboardArrowDown, PushPinOutlined } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { EmptyBlock } from '@/shared';

import { ChatErrorBanner } from './ChatErrorBanner';
import { ChatInput } from './ChatInput';
import { ChatMessageBubble } from './ChatMessageBubble';
import { UnreadMessagesDivider } from './UnreadMessagesDivider';

import type { MessageSide } from '../model/types';
import type { ChatMessage, ChatMessagePin, ChatPeer } from '@/entities/chat';

type ChatConversationProps = {
  messages: ChatMessage[];
  unreadDividerMessageId?: string | null;
  currentUserId: string | null;
  onDeleteMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, content: string) => Promise<boolean>;
  onForwardMessage?: (messageId: string) => void;
  isDeletingMessage?: boolean;
  deletingMessageId?: string | null;
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
};

const toMessageSide = (
  senderId: string,
  currentUserId: string | null
): MessageSide =>
  currentUserId && senderId === currentUserId ? 'outgoing' : 'incoming';

export const ChatConversation = ({
  messages,
  unreadDividerMessageId = null,
  currentUserId,
  onDeleteMessage,
  onEditMessage,
  onForwardMessage,
  isDeletingMessage = false,
  deletingMessageId = null,
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
}: ChatConversationProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesContentRef = useRef<HTMLDivElement>(null);
  const prevPeerIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [pinnedDialogOpen, setPinnedDialogOpen] = useState(false);

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

  const getPinPreview = useCallback((pin: ChatMessagePin) => {
    const trimmed = pin.content.trim();

    if (trimmed) {
      const max = 80;
      return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
    }

    return `Медиа (${pin.mediaCount})`;
  }, []);

  const handleJumpToMessage = useCallback(
    (messageId: string) => {
      setPinnedDialogOpen(false);

      const container = messagesContainerRef.current;
      const el = container?.querySelector(
        `#chat-message-${messageId}`,
      ) as HTMLElement | null;

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setShowScrollToBottom(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!peer) {
      setTimeout(() => {
        setShowScrollToBottom(false);
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
        p: { xs: 2, md: 4 },
        borderRadius: '32px',
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
          {pinnedMessages.length > 0 ? (
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                px: { xs: 1.5, md: 2 },
                py: 1.25,
                bgcolor: 'common.white',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
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
                      maxWidth: { xs: 220, sm: 360, md: 460 },
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
          ) : null}

          <Box
            ref={messagesContentRef}
            sx={{
              height: '100%',
              gap: 1.25,
              px: { xs: 1.5, md: 2 },
              py: { xs: 1.5, md: 2 },
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
                sx={{ width: '100%' }}
              >
                {unreadDividerMessageId === message.id && (
                  <UnreadMessagesDivider />
                )}

                <ChatMessageBubble
                  messageId={message.id}
                  text={message.content}
                  media={message.media}
                  senderId={message.senderId}
                  actorDisplayName={message.actorDisplayName}
                  actorKind={message.actorKind}
                  createdAt={message.createdAt}
                  editedAt={message.editedAt}
                  isRedirected={message.isRedirected}
                  currentUserId={currentUserId}
                  side={toMessageSide(message.senderId, currentUserId)}
                  time={format(new Date(message.createdAt), 'HH:mm')}
                  isRead={message.isRead}
                  isPinned={isMessagePinned(message.id)}
                  onPin={onTogglePinMessage}
                  onDelete={onDeleteMessage}
                  onEdit={onEditMessage}
                  onForward={onForwardMessage}
                  isDeleting={
                    isDeletingMessage && deletingMessageId === message.id
                  }
                  isEditing={
                    isEditingMessage && editingMessageId === message.id
                  }
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
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
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
      </Box>

      <Dialog
        open={pinnedDialogOpen}
        onClose={() => setPinnedDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Закреплённые сообщения</DialogTitle>
        <DialogContent>
          {pinnedMessages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              Нет закреплённых сообщений
            </Typography>
          ) : (
            <List disablePadding>
              {pinnedMessages.map(pin => (
                <Box key={pin.messageId}>
                  <ListItemButton onClick={() => handleJumpToMessage(pin.messageId)}>
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
                        <Typography variant="caption" color="text.secondary">
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
  );
};
