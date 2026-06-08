import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  TextField,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { ConversationItem } from './ConversationItem';

import type { ChatConversation } from '@/entities/chat';

type ContactsProps = {
  conversations: ChatConversation[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
};

export const Contacts = ({
  conversations,
  selectedId,
  isLoading,
  onSelect,
}: ContactsProps) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter(c =>
      c.peer.displayName.toLowerCase().includes(query)
    );
  }, [conversations, search]);

  return (
    <Box
      sx={{
        p: 4,
        mt: 2,
        width: '30%',
        bgcolor: 'white',
        borderRadius: '32px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <TextField
        label="Поиск"
        fullWidth
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <Divider sx={{ my: 2 }} />

      <Stack
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
        direction="column"
        spacing={1}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {filtered.map(conversation => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedId}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
      </Stack>
    </Box>
  );
};
