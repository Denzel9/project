import { GridView, TableRows } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

import type { MyResponseViewMode } from '../model/types';

type MyResponsesViewModeToggleProps = {
  viewMode: MyResponseViewMode;
  onChange: (viewMode: MyResponseViewMode) => void;
};

export const MyResponsesViewModeToggle = ({
  viewMode,
  onChange,
}: MyResponsesViewModeToggleProps) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={viewMode}
    onChange={(_, value: MyResponseViewMode | null) => {
      if (value) onChange(value);
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
);
