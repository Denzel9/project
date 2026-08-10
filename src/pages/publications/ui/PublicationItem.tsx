import {
  LinkOutlined,
  OpenInNewOutlined,
  ScheduleOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router'

import { getPlatformChipSx, getPlatformLabel } from '@/entities/post'
import {
  executorToUserPartial,
  UserDisplayName,
  type User,
} from '@/entities/user'
import { Media } from '@/widgets'

import {
  getPublicationGalleryMediaItems,
  getPublicationPlatformLinks,
  getPublicationPlatforms,
  getPublicationPostPath,
  getPublicationPostTitle,
  getPublicationTaskPath,
  getPublicationTitle,
  publicationHasLink,
} from '../model/utils'

import { AttachPublicationLinkDialog } from './AttachPublicationLinkDialog'

import type { Publication } from '@/entities/publication'
import type { Platform } from '@/entities/post'

type PublicationItemProps = {
  publication: Publication
}

export const PublicationItem = ({ publication }: PublicationItemProps) => {
  const [isAttachLinkOpen, setIsAttachLinkOpen] = useState(false)
  const [openMenuAnchor, setOpenMenuAnchor] = useState<HTMLElement | null>(null)
  const title = getPublicationTitle(publication)
  const postTitle = getPublicationPostTitle(publication)
  const postPath = getPublicationPostPath(publication)
  const taskPath = getPublicationTaskPath(publication)
  const mediaItems = getPublicationGalleryMediaItems(publication)
  const participantUser = publication.executor
    ? executorToUserPartial(publication.executor)
    : (publication.owner as Partial<User>)
  const platformChips = getPublicationPlatforms(publication)
  const platformLinks = getPublicationPlatformLinks(publication)
  const hasLink = publicationHasLink(publication)
  const linkedPlatforms = (
    platformChips.length > 0 ? platformChips : (['OTHER'] as Platform[])
  ).filter(platform => Boolean(platformLinks[platform]))

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setOpenMenuAnchor(event.currentTarget)
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '32px',
        overflow: 'hidden',
      }}
    >
      {mediaItems.length > 0 ? (
        <Box
          sx={{
            aspectRatio: '16 / 10',
            overflow: 'hidden',
            '& > .MuiStack-root': {
              height: '100%',
            },
          }}
        >
          <Media
            items={mediaItems}
            withThumbnails={false}
          />
        </Box>
      ) : (
        <Box
          sx={{
            aspectRatio: '16 / 10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            color: 'text.disabled',
          }}
        >
          <Typography variant="body2">Нет медиа</Typography>
        </Box>
      )}

      <Stack
        sx={{
          flex: 1,
          p: 2,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          spacing={1.5}
          sx={{ flex: 1, minHeight: 0 }}
        >
          <Stack spacing={0}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </Typography>

            <Typography
              component={Link}
              to={postPath}
              variant="body2"
              onClick={event => event.stopPropagation()}
              sx={{
                color: 'info.main',
                textDecoration: 'none',
                transition: 'color 0.2s ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {postTitle}
            </Typography>
          </Stack>

          {publication.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
              }}
            >
              {publication.description}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {platformChips.map(platform => (
              <Chip
                key={platform}
                size="small"
                variant="outlined"
                label={getPlatformLabel(platform)}
                sx={getPlatformChipSx(platform)}
              />
            ))}
          </Stack>
        </Stack>

        <Box
          sx={{
            mt: platformChips.length > 0 ? 2 : 0,
            px: 1.5,
            py: 1.25,
            borderRadius: '14px',
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <ScheduleOutlined
                sx={{ fontSize: 18, color: 'text.secondary' }}
              />
              <Typography variant="body2" color="text.secondary">
                Создано:
              </Typography>
              <Typography variant="body2">
                {formatDistanceToNow(new Date(publication.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </Typography>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Ссылки:
              </Typography>
              {(platformChips.length > 0
                ? platformChips
                : (['OTHER'] as Platform[])
              ).map(platform => {
                const url = platformLinks[platform]
                return (
                  <Stack
                    key={platform}
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ flexShrink: 0 }}
                    >
                      {getPlatformLabel(platform)}:
                    </Typography>
                    {url ? (
                      <Typography
                        component="a"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        onClick={event => event.stopPropagation()}
                        sx={{
                          color: 'info.main',
                          textDecoration: 'none',
                          wordBreak: 'break-all',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {url}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        не указана
                      </Typography>
                    )}
                  </Stack>
                )
              })}
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Участник:
              </Typography>
              <UserDisplayName
                user={participantUser}
                variant="body2"
              />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flexShrink: 0, pt: 1.5 }}>
          <Divider sx={{ mb: 1.5 }} />

          <Stack
            direction="row"
            spacing={1}
            sx={{
              gap: 1,
              alignItems: 'stretch',
              flexWrap: 'nowrap',
            }}
          >
            <Button
              component={Link}
              to={taskPath}
              variant="outlined"
              size="small"
              sx={{ flex: 1, whiteSpace: 'nowrap' }}
            >
              К задаче
            </Button>

            {hasLink ? (
              <>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<OpenInNewOutlined />}
                  onClick={handleOpenMenu}
                  sx={{ flex: 1, whiteSpace: 'nowrap' }}
                >
                  Открыть
                </Button>
                <Menu
                  anchorEl={openMenuAnchor}
                  open={Boolean(openMenuAnchor)}
                  onClose={() => setOpenMenuAnchor(null)}
                >
                  {linkedPlatforms.map(platform => (
                    <MenuItem
                      key={platform}
                      component="a"
                      href={platformLinks[platform]}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpenMenuAnchor(null)}
                    >
                      {getPlatformLabel(platform)}
                    </MenuItem>
                  ))}
                  <MenuItem
                    onClick={() => {
                      setOpenMenuAnchor(null)
                      setIsAttachLinkOpen(true)
                    }}
                  >
                    Изменить ссылки
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<LinkOutlined />}
                onClick={event => {
                  event.stopPropagation()
                  setIsAttachLinkOpen(true)
                }}
                sx={{ flex: 1, whiteSpace: 'nowrap' }}
              >
                Прикрепить ссылку
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>

      <AttachPublicationLinkDialog
        open={isAttachLinkOpen}
        publication={publication}
        onClose={() => setIsAttachLinkOpen(false)}
      />
    </Box>
  )
}
