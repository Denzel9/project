import { PushPinOutlined } from '@mui/icons-material'
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material'

import { type ChatMessagePin } from '@/entities/chat'

import { getPinnedMessagePreview } from '../model/utils/utils'

type ChatPinnedMessagesHeaderProps = {
  pinnedMessages: ChatMessagePin[]
  onJumpToMessage: (messageId: string) => void
  onOpenAll: () => void
}

export const ChatPinnedMessagesHeader = ({
  pinnedMessages,
  onJumpToMessage,
  onOpenAll,
}: ChatPinnedMessagesHeaderProps) => {
  if (pinnedMessages.length === 0) {
    return null
  }

  const firstPin = pinnedMessages[0]
  const hasMultiple = pinnedMessages.length > 1

  const handlePreviewActivate = () => {
    onJumpToMessage(firstPin.messageId)
  }

  return (
    <Box
      data-pinned-header="true"
      sx={{
        pb: 1,
        top: 0,
        zIndex: 10,
        position: 'sticky',
        px: { xs: 1.25, md: 1.5 },
        pt: { xs: 1.25, md: 1.5 },
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          alignItems: 'center',
          px: 1.5,
          py: 1.25,
          borderRadius: '16px',
          bgcolor: 'common.white',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}
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

        <Box
          role="button"
          tabIndex={0}
          onClick={handlePreviewActivate}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handlePreviewActivate()
            }
          }}
          sx={{
            minWidth: 0,
            flex: 1,
            cursor: 'pointer',
            borderRadius: 1,
            '&:hover .pin-preview': {
              color: 'primary.main',
            },
          }}
        >
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', mb: 0.25 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 0.2,
                textTransform: 'uppercase',
              }}
            >
              Закреплено
            </Typography>
            {hasMultiple && (
              <Box
                sx={{
                  px: 0.75,
                  py: 0.1,
                  borderRadius: '999px',
                  bgcolor: 'primary.light',
                  color: 'white',
                  typography: 'caption',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                {pinnedMessages.length}
              </Box>
            )}
          </Stack>
          <Typography
            className="pin-preview"
            variant="body2"
            sx={{
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500,
              transition: 'color 120ms ease',
            }}
          >
            {getPinnedMessagePreview(firstPin)}
          </Typography>
        </Box>

        <Tooltip
          title={hasMultiple ? 'Все закреплённые' : 'Перейти к сообщению'}
        >
          <Button
            sx={{ px: 2 }}
            onClick={() => {
              if (hasMultiple) {
                onOpenAll()
                return
              }

              onJumpToMessage(firstPin.messageId)
            }}
          >
            Все
          </Button>
        </Tooltip>
      </Stack>
    </Box>
  )
}
