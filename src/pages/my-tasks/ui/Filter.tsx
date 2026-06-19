import {
  CalendarMonthOutlined,
  GridView,
  Search,
  TableRows,
  ViewColumn,
} from '@mui/icons-material';
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';

import { TASK_STATUS_LABELS } from '@/entities';
import { useScroll } from '@/shared';

import { KANBAN_COLUMNS } from '../model/kanbanColumns';
import { useMyTaskFilterStore } from '../model/store';

import { TaskSearchPanel } from './TaskSearchPanel';

import type { TaskStatusFilter } from '../model/utils';

export type { TaskViewMode } from '../model/store';

export const MyTaskFilter = () => {
  const { isScrolled, ref } = useScroll(150);

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const {
    status,
    viewMode,
    setStatus,
    setViewMode,
    updatedDate,
    setUpdatedDate,
    toggleKanbanColumn,
    resetKanbanColumns,
    visibleKanbanColumns,
  } = useMyTaskFilterStore();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [columnsAnchorEl, setColumnsAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  const handleDateChange = (date: Dayjs | null) => {
    setUpdatedDate(date ? date.format('YYYY-MM-DD') : null);
    setAnchorEl(null);
  };

  const handleClearDate = () => {
    setUpdatedDate(null);
    setAnchorEl(null);
  };

  return (
    <Stack
      ref={ref}
      direction="row"
      spacing={2}
      sx={{
        px: 2,
        pb: 2,
        width: '100%',
        alignItems: 'center',
        pt: isScrolled ? 4 : 1,
        transition: 'all 0.3s ease',
        justifyContent: 'space-between',
        bgcolor: isScrolled ? 'white' : 'transparent',
        borderBottomLeftRadius: isScrolled ? '32px' : '0',
        borderBottomRightRadius: isScrolled ? '32px' : '0',
        boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ width: '100%' }}
      >
        {viewMode !== 'kanban' && (
          <TextField
            select
            label="Статус"
            value={status}
            size={isMobile ? 'small' : 'medium'}
            sx={{ width: { xs: '48%', md: '20%' } }}
            onChange={e => setStatus(e.target.value as TaskStatusFilter)}
          >
            <MenuItem value="all">Все</MenuItem>
            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
              <MenuItem
                key={value}
                value={value}
              >
                {label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Stack>

      <Stack
        spacing={1}
        direction="row"
      >
        {viewMode === 'kanban' && (
          <IconButton
            color={columnsAnchorEl ? 'primary' : 'default'}
            onClick={event => setColumnsAnchorEl(event.currentTarget)}
          >
            <ViewColumn />
          </IconButton>
        )}

        <IconButton
          color={updatedDate ? 'primary' : 'default'}
          onClick={event => setAnchorEl(event.currentTarget)}
        >
          <CalendarMonthOutlined />
        </IconButton>

        <IconButton
          color={isSearchOpen ? 'primary' : 'default'}
          onClick={() => setIsSearchOpen(true)}
        >
          <Search />
        </IconButton>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={viewMode}
          onChange={(_, value) => {
            if (value) setViewMode(value);
          }}
        >
          <ToggleButton
            value="grid"
            aria-label="Сетка"
          >
            <GridView fontSize="small" />
          </ToggleButton>

          <ToggleButton
            value="kanban"
            aria-label="Kanban"
          >
            <ViewColumn fontSize="small" />
          </ToggleButton>

          <ToggleButton
            value="table"
            aria-label="Таблица"
          >
            <TableRows fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <TaskSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <Popover
        anchorEl={columnsAnchorEl}
        open={Boolean(columnsAnchorEl)}
        onClose={() => setColumnsAnchorEl(null)}
        sx={{
          '& .MuiPopover-paper': {
            p: 2,
            borderRadius: '16px',
            minWidth: 240,
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          Видимые колонки
        </Typography>

        <Stack spacing={0.5}>
          {KANBAN_COLUMNS.map(column => (
            <FormControlLabel
              key={column.status}
              control={
                <Checkbox
                  size="small"
                  checked={visibleKanbanColumns.includes(column.status)}
                  onChange={() => toggleKanbanColumn(column.status)}
                />
              }
              label={column.label}
            />
          ))}
        </Stack>

        <Button
          size="small"
          sx={{ mt: 1 }}
          onClick={resetKanbanColumns}
        >
          Показать все
        </Button>
      </Popover>

      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: '32px',
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <DateCalendar
          value={updatedDate ? dayjs(updatedDate) : null}
          onChange={handleDateChange}
          views={['year', 'month', 'day']}
        />
        {updatedDate && (
          <Button
            fullWidth
            onClick={handleClearDate}
            sx={{ mb: 2, mx: 2, width: 'calc(100% - 32px)' }}
          >
            Все даты
          </Button>
        )}
      </Popover>
    </Stack>
  );
};
