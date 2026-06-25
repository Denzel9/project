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
} from '@mui/material';
import { type Dayjs } from 'dayjs';
import { useState } from 'react';

import { TASK_STATUS_LABELS, type Task } from '@/entities';
import { useScroll, DateCalendarFilter } from '@/shared';

import { KANBAN_COLUMNS } from '../model/constants';
import { useMyTaskFilterStore } from '../model/store';
import { filterTasksByExecutorApprove } from '../model/utils';

import { AddTaskDialog } from './AddTaskDialog';
import { FastButtonGroup } from './FastButtonGroup';
import { TaskSearchPanel } from './TaskSearchPanel';

import type { TaskStatusFilter } from '../model/utils';

export type { TaskViewMode } from '../model/store';
export type { FastButtonValueType } from '../model/utils';

export const MyTaskFilter = ({
  tasks,
  isCompany,
  initialPosts,
}: {
  tasks: Task[];
  isCompany: boolean;
  initialPosts: { id?: string; title?: string }[];
}) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const { isScrolled, ref } = useScroll(150);

  const {
    postId,
    status,
    viewMode,
    setStatus,
    setPostId,
    setViewMode,
    updatedDate,
    setUpdatedDate,
    resetKanbanColumns,
    toggleKanbanColumn,
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

  const activeTasks = filterTasksByExecutorApprove(
    tasks,
    'pending-action',
    isCompany
  );
  const pendingConfirmationTasks = filterTasksByExecutorApprove(
    tasks,
    'pending-executor-assign',
    isCompany
  );
  const rejectedTasks = filterTasksByExecutorApprove(
    tasks,
    'cancelled',
    isCompany
  );

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        p: 4,
        mb: 2,
        bgcolor: 'white',
        borderRadius: '32px',
      }}
    >
      <Stack
        ref={ref}
        direction="row"
        spacing={2}
        sx={{
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
          sx={{
            width: { xs: '100%', md: '100%' },
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: { xs: '100%', md: '50%' } }}
          >
            {viewMode !== 'kanban' && (
              <TextField
                select
                label="Статус"
                value={status}
                sx={{ width: { xs: '100%', md: '100%' } }}
                size="small"
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

            <TextField
              select
              sx={{ width: { xs: '100%', md: '100%' } }}
              label="Пост"
              value={postId}
              size="small"
              onChange={e => setPostId(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              {initialPosts?.map(({ id, title }) => (
                <MenuItem
                  key={id}
                  value={id}
                >
                  {title}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {isCompany && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setIsAddTaskOpen(true)}
            >
              Добавить задачу
            </Button>
          )}
        </Stack>

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
          <DateCalendarFilter
            value={updatedDate}
            onChange={handleDateChange}
            onClear={handleClearDate}
          />
        </Popover>

        <AddTaskDialog
          open={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
        />
      </Stack>

      <Stack
        direction="row"
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
      >
        <FastButtonGroup
          activeTasks={activeTasks}
          rejectedTasks={rejectedTasks}
          pendingConfirmationTasks={pendingConfirmationTasks}
        />

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
      </Stack>

      <TaskSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </Stack>
  );
};
