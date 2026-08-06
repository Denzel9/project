import { GridView, TableRows } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

import type { DashboardUpcomingViewMode } from '../model/types';

type DashboardUpcomingViewModeToggleProps = {
  viewMode: DashboardUpcomingViewMode;
  onChange: (viewMode: DashboardUpcomingViewMode) => void;
};

export const DashboardUpcomingViewModeToggle = ({
  viewMode,
  onChange,
}: DashboardUpcomingViewModeToggleProps) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={viewMode}
    onChange={(_, value: DashboardUpcomingViewMode | null) => {
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
          bgcolor: 'white',
          boxShadow: 1,
        },
      },
    }}
  >
    <Tooltip title="Карточки">
      <ToggleButton
        value="grid"
        aria-label="Карточки"
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
