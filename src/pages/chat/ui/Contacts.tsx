import { Box, CircularProgress, Stack } from '@mui/material';
import { useMemo } from 'react';

import {
  sortConversationsByUnread,
  type ChatConversation,
} from '@/entities/chat';
import { type UserSearchItem } from '@/entities/user';
import { ChatContactSearch } from '@/features/chat';
import { ConversationItem } from '@/widgets/chat';

type ContactsProps = {
  conversations: ChatConversation[];
  selectedId: string | null;
  selectedPeerId?: string | null;
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
  onStartChat: (user: UserSearchItem) => void | Promise<void>;
};

export const Contacts = ({
  conversations,
  selectedId,
  selectedPeerId = null,
  isLoading,
  onSelect,
  onStartChat,
}: ContactsProps) => {
  const sortedConversations = useMemo(
    () => sortConversationsByUnread(conversations),
    [conversations]
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2 },
        width: { xs: '100%', md: '30%' },
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>

        <ChatContactSearch onSelect={onStartChat} size="small" />
      </Stack>

      <Stack
        sx={{
          mt: 2,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
        spacing={1}
        direction="column"
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {sortedConversations.map(conversation => {
          const isDraft = !conversation.id;
          const isSelected = isDraft
            ? conversation.peer.id === selectedPeerId
            : conversation.id === selectedId;

          return (
            <ConversationItem
              key={conversation.id || `draft-${conversation.peer.id}`}
              conversation={conversation}
              onSelect={() => {
                if (conversation.id) {
                  onSelect(conversation.id);
                }
              }}
              isSelected={isSelected}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
