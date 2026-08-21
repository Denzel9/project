import { Close } from '@mui/icons-material'
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import type { ChatMessage } from '@/entities/chat'

import { ChatMessageSearchAutocomplete } from './ChatMessageSearchAutocomplete'

type ChatSearchPanelProps = {
  open: boolean
  onClose: () => void
  conversationId: string | null
  onSelectMessage?: (message: ChatMessage) => void
}

export const ChatSearchPanel = ({
  open,
  onClose,
  conversationId,
  onSelectMessage,
}: ChatSearchPanelProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: { xs: 0, md: 32 },
          borderBottomLeftRadius: { xs: 0, md: 32 },
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2, md: 4 },
          width: isMobile ? '100%' : 400,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Поиск сообщений</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      <ChatMessageSearchAutocomplete
        autoFocus
        conversationId={conversationId}
        size="medium"
        label="Поиск"
        sx={{ width: '100%' }}
        onSelect={message => {
          onSelectMessage?.(message)
          onClose()
        }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Выберите сообщение из списка, чтобы перейти к нему в чате
        </Typography>
      </Box>
    </Drawer>
  )
}
