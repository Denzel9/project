import {
  CalendarMonthOutlined,
  Close,
  FilterList,
  GridView,
  Search,
  TableRows,
  ViewColumn,
  Whatshot,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import { TASK_STATUS_LABELS, type Task } from '@/entities';
import { useScroll, DateCalendarFilter } from '@/shared';

import { KANBAN_COLUMNS } from '../model/constants';
import { useMyTaskFilterStore } from '../model/store';

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
  const [isBottomSectionOpen, setIsBottomSectionOpen] = useState(true);
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

  const hasActiveSelectFilters = useMemo(
    () => status !== 'all' || postId !== 'all',
    [status, postId]
  );

  const handleResetSelectFilters = () => {
    setStatus('all');
    setPostId('all');
  };

  const toggleBottomSection = () => {
    setIsBottomSectionOpen(prev => !prev);
  };

  return (
    <>
      <Stack
        ref={ref}
        direction="column"
        spacing={2}
        sx={{
          p: 4,
          mb: 2,
          bgcolor: 'white',
          borderRadius: '32px',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 0.3s ease',
          boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
            }}
          >
            {viewMode !== 'kanban' && (
              <TextField
                select
                label="Статус"
                value={status}
                size="small"
                onChange={e => setStatus(e.target.value as TaskStatusFilter)}
                sx={{ flex: 1, width: '250px' }}
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
              label="Пост"
              value={postId}
              size="small"
              onChange={e => setPostId(e.target.value)}
              sx={{ flex: 1, width: '250px' }}
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

            <IconButton>
              <Whatshot color="info" />
            </IconButton>

            {hasActiveSelectFilters && (
              <Button
                size="small"
                startIcon={<Close />}
                onClick={handleResetSelectFilters}
                sx={{ flexShrink: 0, whiteSpace: 'nowrap', px: 2 }}
              >
                Сбросить
              </Button>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center' }}
          >
            {isCompany && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => setIsAddTaskOpen(true)}
                sx={{
                  px: 2,
                  flexShrink: 0,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                Добавить задачу
              </Button>
            )}

            <Tooltip
              title={isBottomSectionOpen ? 'Скрыть панель' : 'Показать панель'}
            >
              <IconButton
                size="small"
                color={isBottomSectionOpen ? 'primary' : 'default'}
                onClick={toggleBottomSection}
              >
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Collapse
          in={isBottomSectionOpen}
          sx={{ mt: '0px !important' }}
        >
          <Divider sx={{ mt: 2 }} />

          <Stack
            direction="row"
            sx={{
              width: '100%',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 1,
              mt: 2,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <FastButtonGroup
                tasks={tasks}
                isCompany={isCompany}
              />
            </Box>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ flexShrink: 0, alignItems: 'center' }}
            >
              {viewMode === 'kanban' && (
                <Tooltip title="Колонки Kanban">
                  <IconButton
                    size="small"
                    color={columnsAnchorEl ? 'primary' : 'default'}
                    onClick={event => setColumnsAnchorEl(event.currentTarget)}
                  >
                    <ViewColumn fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip
                title={updatedDate ? `Дата: ${updatedDate}` : 'Фильтр по дате'}
              >
                <IconButton
                  size="small"
                  color={updatedDate ? 'primary' : 'default'}
                  onClick={event => setAnchorEl(event.currentTarget)}
                >
                  <CalendarMonthOutlined fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Поиск">
                <IconButton
                  size="small"
                  color={isSearchOpen ? 'primary' : 'default'}
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search fontSize="small" />
                </IconButton>
              </Tooltip>

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
                    border: 'none',
                    borderRadius: '8px !important',
                    mx: 0.25,
                    px: 1,
                    py: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'white',
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
                    <GridView fontSize="small" />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="Kanban">
                  <ToggleButton
                    value="kanban"
                    aria-label="Kanban"
                  >
                    <ViewColumn fontSize="small" />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="Таблица">
                  <ToggleButton
                    value="table"
                    aria-label="Таблица"
                  >
                    <TableRows fontSize="small" />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Collapse>
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

      <TaskSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
