import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { ChatInput } from './ChatInput';
import { ChatMessageBubble } from './ChatMessageBubble';

import type { MessageSide } from '../model/types';
import type { ChatMessage, ChatPeer } from '@/entities/chat';

type ChatConversationProps = {
  messages: ChatMessage[];
  currentUserId: string | null;
  peer: ChatPeer | null;
  draft: string;
  pendingFiles: File[];
  isSending?: boolean;
  onDraftChange: (value: string) => void;
  onAttachFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onSend: () => void;
  isLoading?: boolean;
  error?: string | null;
};

const toMessageSide = (
  senderId: string,
  currentUserId: string | null
): MessageSide =>
  currentUserId && senderId === currentUserId ? 'outgoing' : 'incoming';

export const ChatConversation = ({
  messages,
  currentUserId,
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
}: ChatConversationProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesContentRef = useRef<HTMLDivElement>(null);
  const prevPeerIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef(0);

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

    prevPeerIdRef.current = peer.id;
    prevMessagesLengthRef.current = messages.length;

    if (peerChanged) {
      scrollToBottom('auto');
      return;
    }

    if (messagesAdded && (peerChanged || isNearBottom())) {
      scrollToBottom(peerChanged ? 'auto' : 'smooth');
    }
  }, [peer, messages, isLoading, isNearBottom, scrollToBottom]);

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
        flex: 1,
        minHeight: 0,
        p: { xs: 2, md: 4 },
        borderRadius: '32px',
        bgcolor: 'common.white',
      }}
    >
      {error && (
        <Typography
          color="error"
          sx={{ mb: 1 }}
          variant="body2"
        >
          {error}
        </Typography>
      )}

      <Box
        ref={messagesContainerRef}
        sx={{
          mb: 2,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflowY: 'scroll',
          overflowX: 'visible',
          borderRadius: '24px',
          scrollbarWidth: 'none',
          flexDirection: 'column',
        }}
      >
        <Box
          ref={messagesContentRef}
          sx={{
            gap: 2,
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 2 }}
            >
              Начните переписку
            </Typography>
          )}

          {messages.map(message => (
            <ChatMessageBubble
              key={message.id}
              text={message.content}
              media={message.media}
              senderId={message.senderId}
              side={toMessageSide(message.senderId, currentUserId)}
              time={format(new Date(message.createdAt), 'HH:mm')}
            />
          ))}
        </Box>
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
    </Stack>
  );
};
