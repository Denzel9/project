import { FilterList } from '@mui/icons-material'
import { IconButton } from '@mui/material'

type ColumnFilterButtonProps = {
  active?: boolean
  open?: boolean
  title: string
  onClick: () => void
}

export const ColumnFilterButton = ({
  active = false,
  open = false,
  title,
  onClick,
}: ColumnFilterButtonProps) => (
  <IconButton
    size="small"
    color={active || open ? 'primary' : 'default'}
    aria-label={`Фильтр: ${title}`}
    aria-expanded={open}
    onClick={event => {
      event.stopPropagation()
      onClick()
    }}
    sx={{
      p: 0.5,
      ...(open && {
        bgcolor: 'action.selected',
      }),
    }}
  >
    <FilterList sx={{ fontSize: 18 }} />
  </IconButton>
)
