import { Close, PushPinOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'

import {
  type ChatMessagePin,
} from '@/entities'

import { getPinnedMessageAuthorName, getPinnedMessagePreview } from '../model/utils/utils'

type ChatPinnedMessagesDialogProps = {
  open: boolean
  pinnedMessages: ChatMessagePin[]
  onClose: () => void
  onSelect: (messageId: string) => void
}


export const ChatPinnedMessagesDialog = ({
  open,
  pinnedMessages,
  onClose,
  onSelect,
}: ChatPinnedMessagesDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: { xs: 2, sm: 3 },
          },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <PushPinOutlined sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Typography
            variant="h6"
            noWrap
          >
            Закреплённые сообщения
          </Typography>
        </Stack>

        <IconButton
          aria-label="Закрыть"
          onClick={onClose}
        >
          <Close />
        </IconButton>
      </Stack>

      {pinnedMessages.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 4 }}
        >
          Нет закреплённых сообщений
        </Typography>
      ) : (
        <Stack
          spacing={1}
          sx={{
            maxHeight: 'min(60vh, 480px)',
            overflowY: 'auto',
            pr: 0.5,
            scrollbarWidth: 'none',
          }}
        >
          {pinnedMessages?.map(pin => (
            <Box
              key={pin.messageId}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(pin.messageId)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(pin.messageId)
                }
              }}
              sx={{
                p: 1.5,
                borderRadius: '16px',
                bgcolor: 'secondary.light',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'background-color 120ms ease, border-color 120ms ease',
                '&:hover': {
                  bgcolor: 'secondary.main',
                },
              }}
            >

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  {getPinnedMessageAuthorName(pin)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', flexShrink: 0 }}
                >
                  {format(new Date(pin.pinnedAt), 'dd.MM.yyyy HH:mm')}
                </Typography>
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1 }}
              >
                {pin.scope === 'PERSONAL' ? 'Только вы' : 'Для всех'}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getPinnedMessagePreview(pin)}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      <Stack
        direction="row"
        sx={{ mt: 3, justifyContent: 'flex-end' }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Закрыть
        </Button>
      </Stack>
    </Dialog>
  )
}
