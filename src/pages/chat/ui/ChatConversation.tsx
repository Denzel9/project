import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useEffect, useRef } from 'react';

import type { ChatMessage, ChatPeer } from '@/entities/chat';

import { ChatInput } from './ChatInput';
import { ChatMessageBubble } from './ChatMessageBubble';

import type { MessageSide } from '../model/types';

type ChatConversationProps = {
  messages: ChatMessage[];
  currentUserId: string | null;
  peer: ChatPeer | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  error?: string | null;
};

const toMessageSide = (
  senderId: string,
  currentUserId: string | null,
): MessageSide =>
  currentUserId && senderId === currentUserId ? 'outgoing' : 'incoming';

export const ChatConversation = ({
  messages,
  currentUserId,
  peer,
  draft,
  onDraftChange,
  onSend,
  isLoading = false,
  error = null,
}: ChatConversationProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!peer) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          flex: 1,
          bgcolor: 'common.white',
          borderRadius: '32px',
          p: 4,
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
        p: 3,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: 'common.white',
        borderRadius: '32px',
        position: 'relative',
      }}
    >
      {error && (
        <Typography
          variant="body2"
          color="error"
          sx={{ mb: 1 }}
        >
          {error}
        </Typography>
      )}

      <Box
        sx={{
          p: 3,
          mb: 2,
          gap: 2,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflowY: 'auto',
          borderRadius: '24px',
          flexDirection: 'column',
          bgcolor: 'secondary.light',
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
            side={toMessageSide(message.senderId, currentUserId)}
            time={format(new Date(message.createdAt), 'HH:mm')}
          />
        ))}
        <Box ref={bottomRef} />
      </Box>

      <ChatInput
        value={draft}
        onChange={onDraftChange}
        onSend={onSend}
      />
    </Stack>
  );
};
