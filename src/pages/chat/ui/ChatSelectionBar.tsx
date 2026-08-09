import {
  Close,
  DeleteOutlined,
  Forward,
} from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'

type ChatSelectionBarProps = {
  selectedCount: number
  isDeleting?: boolean
  disabled?: boolean
  onClose: () => void
  onDelete: () => void
  onForward: () => void
}

export const ChatSelectionBar = ({
  selectedCount,
  isDeleting = false,
  disabled = false,
  onClose,
  onDelete,
  onForward,
}: ChatSelectionBarProps) => {
  const hasSelection = selectedCount > 0
  const isBusy = disabled || isDeleting

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        minHeight: 56,
        px: 1.5,
        py: 1,
        alignItems: 'center',
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'secondary.light',
      }}
    >
      <IconButton
        aria-label="Закрыть выбор"
        onClick={onClose}
        disabled={isBusy}
        size="small"
      >
        <Close />
      </IconButton>

      <Typography
        variant="body2"
        sx={{ flex: 1, fontWeight: 600, minWidth: 0 }}
      >
        {selectedCount > 0
          ? `Выбрано: ${selectedCount}`
          : 'Выберите сообщения'}
      </Typography>

      <Button
        variant="text"
        color="inherit"
        disabled={!hasSelection || isBusy}
        onClick={onForward}
        startIcon={<Forward sx={{ transform: 'scaleX(-1)' }} />}
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        Переслать
      </Button>

      <Button
        variant="text"
        color="error"
        disabled={!hasSelection || isBusy}
        onClick={onDelete}
        startIcon={
          isDeleting ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <DeleteOutlined />
          )
        }
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        Удалить
      </Button>
    </Stack>
  )
}
