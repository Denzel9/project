import { Close } from '@mui/icons-material'
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'

import {
  appDialogCloseButtonSx,
  appDialogContentSx,
  appDialogPaperSx,
} from './appDialogStyles'

import type { PropsWithChildren, ReactNode } from 'react'

type AppDialogProps = PropsWithChildren<{
  open: boolean
  onClose: () => void
  title?: ReactNode
  /** Desktop paper min-width in px. Default 560. */
  minWidth?: number
  /** Desktop paper fixed/max width in px. */
  width?: number
  hideCloseButton?: boolean
  paperSx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
  actions?: ReactNode
  fullWidth?: boolean
  /** If true, Escape does not close the dialog. */
  disableEscapeKeyDown?: boolean
}>

export const AppDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  minWidth = 560,
  width,
  hideCloseButton = false,
  paperSx,
  contentSx,
  fullWidth,
  disableEscapeKeyDown = false,
}: AppDialogProps) => (
  <Dialog
    open={open}
    fullWidth={fullWidth}
    onClose={(_event, reason) => {
      if (disableEscapeKeyDown && reason === 'escapeKeyDown') return
      onClose()
    }}
    slotProps={{
      paper: {
        sx: [
          appDialogPaperSx,
          {
            minWidth: { xs: 0, md: width ?? minWidth },
            ...(width
              ? {
                  width: { xs: 'calc(100% - 32px)', md: `${width}px` },
                  maxWidth: { xs: 'calc(100% - 32px)', md: `${width}px` },
                }
              : null),
          },
          ...(paperSx ? (Array.isArray(paperSx) ? paperSx : [paperSx]) : []),
        ],
      },
    }}
  >
    {!hideCloseButton && (
      <IconButton
        onClick={onClose}
        color="primary"
        aria-label="Закрыть"
        sx={appDialogCloseButtonSx}
      >
        <Close />
      </IconButton>
    )}

    <Box
      sx={[
        appDialogContentSx,
        ...(contentSx ? (Array.isArray(contentSx) ? contentSx : [contentSx]) : []),
      ]}
    >
      {title != null && title !== '' && (
        <Typography variant="h6">{title}</Typography>
      )}

      {children}

      {actions}
    </Box>
  </Dialog>
)
