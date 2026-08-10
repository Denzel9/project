import { Box } from '@mui/material'
import { useMemo } from 'react'

import { getMediaDisplayName, getMediaKind, MediaItem } from '@/widgets/media'

import type { ChatMessageMedia } from '@/entities/chat'

type ChatMediaAlbumProps = {
  media: ChatMessageMedia[]
  onOpenImage: (url: string) => void
}

/** Telegram-like album grid templates by item count (visual tiles only). */
const getAlbumLayout = (count: number): { columns: string; areas: string[] } => {
  switch (count) {
    case 1:
      return { columns: '1fr', areas: ['a'] }
    case 2:
      return { columns: '1fr 1fr', areas: ['a b'] }
    case 3:
      return {
        columns: '1fr 1fr',
        areas: ['a b', 'a c'],
      }
    case 4:
      return {
        columns: '1fr 1fr',
        areas: ['a b', 'c d'],
      }
    case 5:
      return {
        columns: '1fr 1fr 1fr',
        areas: ['a a b', 'c d e'],
      }
    case 6:
      return {
        columns: '1fr 1fr 1fr',
        areas: ['a b c', 'd e f'],
      }
    case 7:
      return {
        columns: '1fr 1fr 1fr',
        areas: ['a a b', 'c d e', 'f g g'],
      }
    case 8:
      return {
        columns: '1fr 1fr 1fr 1fr',
        areas: ['a a b b', 'c d e f', 'g g h h'],
      }
    default:
      return {
        columns: '1fr 1fr 1fr',
        areas: Array.from({ length: Math.ceil(count / 3) }, (_, row) => {
          const start = row * 3
          return [start, start + 1, start + 2]
            .filter(i => i < count)
            .map(i => String.fromCharCode(97 + i))
            .join(' ')
        }),
      }
  }
}

const getTileArea = (index: number) => String.fromCharCode(97 + index)

const getAlbumHeight = (count: number) => {
  if (count === 1) return 220
  if (count === 2) return 148
  if (count <= 4) return 200
  if (count <= 6) return 236
  return 260
}

export const ChatMediaAlbum = ({ media, onOpenImage }: ChatMediaAlbumProps) => {
  const visual = useMemo(
    () =>
      media.filter(item => {
        const kind = getMediaKind(item.url, item.mimeType)
        return kind === 'image' || kind === 'video'
      }),
    [media],
  )

  const documents = useMemo(
    () =>
      media.filter(item => getMediaKind(item.url, item.mimeType) === 'document'),
    [media],
  )

  const layout = useMemo(
    () => getAlbumLayout(Math.min(visual.length, 9)),
    [visual.length],
  )

  const visibleVisual = visual.slice(0, 9)
  const overflow = visual.length - visibleVisual.length
  const albumHeight = getAlbumHeight(visibleVisual.length)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {visibleVisual.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: layout.columns,
            gridTemplateAreas: layout.areas.map(row => `"${row}"`).join(' '),
            gap: '2px',
            width: '100%',
            height: albumHeight,
            maxHeight: { xs: 200, sm: albumHeight },
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: 'rgba(0,0,0,0.04)',
          }}
        >
          {visibleVisual.map((item, index) => {
            const kind = getMediaKind(item.url, item.mimeType)
            const isImage = kind === 'image'
            const isLast = index === visibleVisual.length - 1
            const showOverflow = isLast && overflow > 0

            return (
              <Box
                key={item.key}
                onClick={event => {
                  event.stopPropagation()
                  if (isImage) onOpenImage(item.url)
                }}
                sx={{
                  gridArea: getTileArea(index),
                  position: 'relative',
                  minWidth: 0,
                  minHeight: 0,
                  cursor: isImage ? 'zoom-in' : 'default',
                  overflow: 'hidden',
                  '& img, & video': {
                    borderRadius: '0 !important',
                  },
                }}
              >
                <MediaItem
                  src={item.url}
                  alt="Вложение"
                  mimeType={item.mimeType}
                  fileName={getMediaDisplayName(item.fileName, item.key)}
                />

                {showOverflow && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.45)',
                      color: 'common.white',
                      typography: 'h6',
                      fontWeight: 600,
                      pointerEvents: 'none',
                    }}
                  >
                    +{overflow}
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      )}

      {documents.map(item => (
        <Box
          key={item.key}
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: 'rgba(0,0,0,0.04)',
          }}
        >
          <MediaItem
            src={item.url}
            alt="Документ"
            mimeType={item.mimeType}
            fileName={getMediaDisplayName(item.fileName, item.key)}
          />
        </Box>
      ))}
    </Box>
  )
}
