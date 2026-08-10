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
import { useEffect, useMemo, useState } from 'react'

import { getPlatformLabel, type Platform } from '@/entities/post'
import { useUpdatePublicationMutation } from '@/entities/publication'

import {
  getPublicationPlatformLinks,
  getPublicationPlatforms,
} from '../model/utils'

import type { Publication } from '@/entities/publication'

type AttachPublicationLinkDialogProps = {
  open: boolean
  publication: Publication | null
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
  publication,
  onClose,
}: AttachPublicationLinkDialogProps) => {
  const platforms = useMemo((): Platform[] => {
    if (!publication) return []
    const fromPublication = getPublicationPlatforms(publication)
    return fromPublication.length > 0 ? fromPublication : ['OTHER']
  }, [publication])

  const [urls, setUrls] = useState<Partial<Record<Platform, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useUpdatePublicationMutation()

  useEffect(() => {
    if (!open || !publication) return

    const existing = getPublicationPlatformLinks(publication)
    const next: Partial<Record<Platform, string>> = {}
    for (const platform of platforms) {
      next[platform] = existing[platform] ?? ''
    }
    setUrls(next)
    setError(null)
  }, [open, publication, platforms])

  const handleClose = () => {
    if (isPending) return
    onClose()
  }

  const handleSubmit = async () => {
    if (!publication) return

    for (const platform of platforms) {
      const trimmed = urls[platform]?.trim() ?? ''
      if (trimmed && !isValidHttpUrl(trimmed)) {
        setError(
          `Некорректный URL для «${getPlatformLabel(platform)}» (http:// или https://)`,
        )
        return
      }
    }

    try {
      setError(null)
      await mutateAsync({
        id: publication.id,
        links: platforms.map(platform => ({
          platform,
          url: urls[platform]?.trim() || null,
        })),
      })
      onClose()
    } catch {
      setError('Не удалось сохранить ссылки')
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
        <Typography variant="h6">Ссылки на публикацию</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Одна ссылка на каждую площадку
        </Typography>

        <Stack spacing={2} sx={{ mt: 3 }}>
          {platforms.map(platform => (
            <TextField
              key={platform}
              fullWidth
              label={getPlatformLabel(platform)}
              placeholder="https://"
              value={urls[platform] ?? ''}
              onChange={event => {
                setUrls(prev => ({ ...prev, [platform]: event.target.value }))
                if (error) setError(null)
              }}
              disabled={isPending}
            />
          ))}

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
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
            disabled={isPending}
            onClick={() => void handleSubmit()}
          >
            Сохранить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  )
}
