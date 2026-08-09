import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

import { useUpdatePublicationMutation } from '@/entities/publication'

type AttachPublicationLinkDialogProps = {
  open: boolean
  publicationId: string | null
  onClose: () => void
}

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const AttachPublicationLinkDialog = ({
  open,
  publicationId,
  onClose,
}: AttachPublicationLinkDialogProps) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useUpdatePublicationMutation()

  useEffect(() => {
    if (!open) return
    setUrl('')
    setError(null)
  }, [open, publicationId])

  const handleClose = () => {
    if (isPending) return
    onClose()
  }

  const handleSubmit = async () => {
    const trimmed = url.trim()

    if (!publicationId) return

    if (!trimmed) {
      setError('Введите ссылку')
      return
    }

    if (!isValidHttpUrl(trimmed)) {
      setError('Укажите корректный URL (http:// или https://)')
      return
    }

    try {
      setError(null)
      await mutateAsync({ id: publicationId, externalUrl: trimmed })
      onClose()
    } catch {
      setError('Не удалось сохранить ссылку')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          width: 520,
          maxWidth: '90%',
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        color="primary"
        disabled={isPending}
        sx={{
          top: 0,
          right: -60,
          position: 'absolute',
          bgcolor: 'secondary.main',
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Прикрепить ссылку</Typography>

        <Stack spacing={2} sx={{ mt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            label="Ссылка на публикацию"
            placeholder="https://"
            value={url}
            onChange={event => {
              setUrl(event.target.value)
              if (error) setError(null)
            }}
            error={Boolean(error)}
            helperText={error}
            disabled={isPending}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void handleSubmit()
              }
            }}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4, justifyContent: 'flex-end' }}
        >
          <Button onClick={handleClose} disabled={isPending}>
            Отменить
          </Button>
          <Button
            color="primary"
            variant="contained"
            loading={isPending}
            disabled={isPending || !url.trim()}
            onClick={() => void handleSubmit()}
          >
            Сохранить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  )
}
