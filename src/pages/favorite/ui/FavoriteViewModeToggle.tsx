import { GridView, TableRows } from '@mui/icons-material'
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'

import type { FavoriteViewMode } from '../model/types'

type FavoriteViewModeToggleProps = {
  viewMode: FavoriteViewMode
  onChange: (viewMode: FavoriteViewMode) => void
}

export const FavoriteViewModeToggle = ({
  viewMode,
  onChange,
}: FavoriteViewModeToggleProps) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={viewMode}
    onChange={(_, value: FavoriteViewMode | null) => {
      if (value) onChange(value)
    }}
    sx={{
      bgcolor: 'grey.50',
      borderRadius: '10px',
      flexShrink: 0,
      '& .MuiToggleButton-root': {
        px: 1,
        py: 0.5,
        mx: 0.25,
        border: 'none',
        borderRadius: '8px !important',
        '&.Mui-selected': {
          bgcolor: 'background.paper',
          boxShadow: 1,
        },
      },
    }}
  >
    <Tooltip title="Сетка">
      <ToggleButton
        value="grid"
        aria-label="Сетка"
      >
        <GridView
          fontSize="small"
          color={viewMode === 'grid' ? 'primary' : 'inherit'}
        />
      </ToggleButton>
    </Tooltip>

    <Tooltip title="Таблица">
      <ToggleButton
        value="table"
        aria-label="Таблица"
      >
        <TableRows
          fontSize="small"
          color={viewMode === 'table' ? 'primary' : 'inherit'}
        />
      </ToggleButton>
    </Tooltip>
  </ToggleButtonGroup>
)
