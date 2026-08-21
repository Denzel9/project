import { Box, Popover, Typography } from '@mui/material'
import { EmojiPicker } from 'frimousse'

type ChatEmojiPickerProps = {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onEmojiSelect: (emoji: string) => void
}

export const ChatEmojiPicker = ({
  anchorEl,
  open,
  onClose,
  onEmojiSelect,
}: ChatEmojiPickerProps) => (
  <Popover
    open={open}
    onClose={onClose}
    disableScrollLock
    anchorEl={anchorEl}
    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
    transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    slotProps={{
      paper: {
        sx: {
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 3,
        },
      },
    }}
  >
    <Box
      sx={{
        width: 320,
        height: 320,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        '& [frimousse-root]': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        },
        '& [frimousse-search]': {
          m: 1.5,
          mb: 1,
          px: 1.5,
          py: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          outline: 'none',
          bgcolor: 'background.paper',
          color: 'text.primary',
          typography: 'body2',
          '&:focus': {
            borderColor: 'primary.main',
          },
        },
        '& [frimousse-viewport]': {
          flex: 1,
          minHeight: 0,
          position: 'relative',
          outline: 'none',
        },
        '& [frimousse-list]': {
          paddingBottom: 1.5,
          userSelect: 'none',
          width: '100%',
        },
        '& [frimousse-category-header]': {
          px: 1.5,
          py: 0.75,
          typography: 'caption',
          fontWeight: 600,
          color: 'text.secondary',
          bgcolor: 'background.paper',
        },
        '& [frimousse-row]': {
          display: 'flex',
          width: '100%',
          boxSizing: 'border-box',
          px: 1.5,
          scrollMarginTop: 32,
        },
        '& [frimousse-emoji]': {
          display: 'flex',
          flex: '1 1 0',
          minWidth: 0,
          aspectRatio: '1 / 1',
          height: 'auto',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: '8px',
          bgcolor: 'transparent',
          cursor: 'pointer',
          fontSize: '1.25rem',
          lineHeight: 1,
          '&:hover, &[data-active]': {
            bgcolor: 'action.hover',
          },
        },
        '& [frimousse-loading], & [frimousse-empty]': {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          typography: 'body2',
        },
      }}
    >
      <EmojiPicker.Root
        locale="ru"
        columns={8}
        onEmojiSelect={({ emoji }) => {
          onEmojiSelect(emoji)
          onClose()
        }}
      >
        <EmojiPicker.Search placeholder="Поиск эмодзи" />
        <EmojiPicker.Viewport>
          <EmojiPicker.Loading>
            <Typography variant="body2" color="text.secondary">
              Загрузка…
            </Typography>
          </EmojiPicker.Loading>
          <EmojiPicker.Empty>
            <Typography variant="body2" color="text.secondary">
              Ничего не найдено
            </Typography>
          </EmojiPicker.Empty>
          <EmojiPicker.List />
        </EmojiPicker.Viewport>
      </EmojiPicker.Root>
    </Box>
  </Popover>
)
