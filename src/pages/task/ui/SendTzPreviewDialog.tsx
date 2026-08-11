import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'

import { type Task } from '@/entities'
import { formatTaskTzForChat } from '@/features/chat'
import { MarkdownContent } from '@/shared'
import { MediaItem } from '@/widgets'

type SendTzPreviewDialogProps = {
  open: boolean
  task: Task
  isSending?: boolean
  onClose: () => void
  onConfirm: () => void
}

export const SendTzPreviewDialog = ({
  open,
  task,
  isSending = false,
  onClose,
  onConfirm,
}: SendTzPreviewDialogProps) => {
  const previewMarkdown = useMemo(
    () => (open ? formatTaskTzForChat(task) : ''),
    [open, task],
  )

  const media = task.media ?? []

  const handleClose = () => {
    if (isSending) return
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          m: 0,
          outline: 'none',
          position: 'relative',
          borderRadius: '32px',
          width: { md: 640, xs: '100%' },
          maxWidth: { xs: '100%', md: '92%' },
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2.5, sm: 3 },
        },
      }}
    >
      <IconButton
        aria-label="Закрыть"
        onClick={handleClose}
        disabled={isSending}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
        }}
      >
        <Close />
      </IconButton>

      <Stack spacing={0.5} sx={{ mb: 2, pr: 5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Отправить ТЗ исполнителю
        </Typography>
        {media.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Вместе с текстом будут прикреплены медиа ТЗ ({media.length})
          </Typography>
        )}
      </Stack>

      {media.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: 1,
            mb: 2,
          }}
        >
          {media.slice(0, 8).map(item => (
            <Box
              key={item.id ?? item.key}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <MediaItem
                src={item.url}
                mimeType={item.mimeType}
                alt={item.key}
              />
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '24px',
          bgcolor: 'grey.50',
          p: 2,
          mb: 2,
        }}
      >
        <MarkdownContent
          content={previewMarkdown}
          sx={{
            fontSize: '0.875rem',
            '& h1': {
              fontSize: '1.1rem',
              fontWeight: 700,
              mb: 1,
            },
            '& h2': {
              fontSize: '0.95rem',
              fontWeight: 600,
              mt: 1.5,
              mb: 0.5,
            },
          }}
        />
      </Box>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={handleClose} disabled={isSending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isSending}
          onClick={onConfirm}
          startIcon={
            isSending ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          Отправить
        </Button>
      </Stack>
    </Dialog>
  )
}
