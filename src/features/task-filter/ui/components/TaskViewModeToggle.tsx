import { GridView, TableRows, ViewColumn } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

import { useMyTaskFilterStore } from '../../model/store';

export const TaskViewModeToggle = () => {
  const { viewMode, setViewMode } = useMyTaskFilterStore();

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={viewMode}
      onChange={(_, value) => {
        if (value) setViewMode(value);
      }}
      sx={{
        bgcolor: 'grey.50',
        borderRadius: '10px',
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

      <Tooltip title="Kanban">
        <ToggleButton
          value="kanban"
          aria-label="Kanban"
        >
          <ViewColumn
            fontSize="small"
            color={viewMode === 'kanban' ? 'primary' : 'inherit'}
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
};
