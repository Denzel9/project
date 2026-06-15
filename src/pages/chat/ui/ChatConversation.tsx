import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useEffect, useRef } from 'react';

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
        sx={{
          flex: 1,
          bgcolor: 'common.white',
          borderRadius: '32px',
          p: 4,
          alignItems: 'center',
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
        p: 4,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
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
        sx={{
          flex: 1,
          minHeight: 0,
          p: 3,
          mb: 2,
          gap: 2,
          display: 'flex',
          overflowY: 'auto',
          borderRadius: '24px',
          flexDirection: 'column',
          scrollbarWidth: 'none',
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
            media={message.media}
            senderId={message.senderId}
            side={toMessageSide(message.senderId, currentUserId)}
            time={format(new Date(message.createdAt), 'HH:mm')}
          />
        ))}
        <Box ref={bottomRef} />
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
