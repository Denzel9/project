import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense } from 'react';

import type { ChatInput } from './ChatInput';
import type { ComponentProps } from 'react';

const ChatInputLazy = lazy(() =>
  import('./ChatInput').then(module => ({ default: module.ChatInput })),
);

type LazyChatInputProps = ComponentProps<typeof ChatInput>;

export const LazyChatInput = (props: LazyChatInputProps) => (
  <Suspense
    fallback={
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 1.5,
        }}
      >
        <CircularProgress size={22} />
      </Box>
    }
  >
    <ChatInputLazy {...props} />
  </Suspense>
);

export default LazyChatInput;
