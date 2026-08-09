import { Close, OpenInNewOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material'

import type { PublicationLinkItem } from '../model/utils'

type PublicationLinksDialogProps = {
  open: boolean
  links: PublicationLinkItem[]
  onClose: () => void
}

export const PublicationLinksDialog = ({
  open,
  links,
  onClose,
}: PublicationLinksDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          width: 640,
          maxWidth: '90%',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        color="primary"
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
        <Typography variant="h6">Ссылки на публикации</Typography>

        <Box
          sx={{
            mt: 3,
            maxHeight: 'min(60vh, 480px)',
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
          }}
        >
          {!links.length ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 4, px: 2 }}
            >
              Пока нет прикреплённых ссылок
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />}>
              {links.map(item => (
                <Stack
                  key={item.id}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    px: 2,
                    py: 1.5,
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.platformLabel}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{
                        typography: 'body2',
                        wordBreak: 'break-all',
                      }}
                    >
                      {item.url}
                    </Link>
                  </Stack>

                  <Button
                    size="small"
                    variant="outlined"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewOutlined />}
                    sx={{
                      flexShrink: 0,
                      alignSelf: { xs: 'flex-start', sm: 'center' },
                    }}
                  >
                    Открыть
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>

        <Stack direction="row" sx={{ mt: 4, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Закрыть</Button>
        </Stack>
      </Box>
    </Dialog>
  )
}
