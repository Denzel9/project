import {
  CalendarMonthOutlined,
  Close,
  Search,
  ViewColumn,
  Whatshot,
} from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import { TASK_STATUS_LABELS } from '@/entities';
import {
  getPartnerName,
  mapPartnerUserToRow,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities/partner';
import { useScroll, DateCalendarFilter, FilterAutocomplete } from '@/shared';

import { KANBAN_COLUMNS } from '../model/constants';
import { useMyTaskFilterStore } from '../model/store';

import { AssigneeFilterMenu, useIsManagerAccount } from './components/AssigneeFilterMenu';
import { FastButtonGroup } from './components/FastButtonGroup';
import {
  TaskFilterActionsMenu,
  type TaskTableReportControls,
} from './components/TaskFilterActionsMenu';
import { TaskViewModeToggle } from './components/TaskViewModeToggle';

import type { TaskStatusFilter } from '../model/utils';

export type { TaskViewMode } from '../model/store';
export type { FastButtonValueType } from '../model/utils';
export type { TaskTableReportControls };

export const MyTaskFilter = ({
  isCompany,
  initialPosts,
  tableReport,
}: {
  isCompany: boolean;
  initialPosts: { id?: string; title?: string }[];
  tableReport?: TaskTableReportControls;
}) => {
  const { isScrolled, ref } = useScroll(150);
  const isManagerAccount = useIsManagerAccount();

  const {
    postId,
    executorId,
    status,
    viewMode,
    extraFilter,
    onlyMyTasks,
    assigneeAccountId,
    setStatus,
    setPostId,
    setExecutorId,
    updatedDate,
    setUpdatedDate,
    setExtraFilter,
    setOnlyMyTasks,
    setAssigneeAccountId,
    resetKanbanColumns,
    toggleKanbanColumn,
    visibleKanbanColumns,
    isSearchOpen,
    searchQuery,
    setIsSearchOpen,
    setSearchQuery,
  } = useMyTaskFilterStore();

  const { data: executorsData, isLoading: isExecutorsLoading } =
    usePartnerExecutorsQuery({ sort: 'name' }, { enabled: isCompany });
  const { data: customersData, isLoading: isCustomersLoading } =
    usePartnerCustomersQuery({ sort: 'name' }, { enabled: !isCompany });

  const partnerOptions = useMemo(() => {
    const items = isCompany
      ? (executorsData?.items ?? [])
      : (customersData?.items ?? []);

    return items.map(item => ({
      id: item.id,
      label: isCompany ? mapPartnerUserToRow(item).name : getPartnerName(item),
    }));
  }, [customersData?.items, executorsData?.items, isCompany]);

  const isPartnersLoading = isCompany ? isExecutorsLoading : isCustomersLoading;

  const postOptions = useMemo(
    () =>
      (initialPosts ?? [])
        .filter((post): post is { id: string; title?: string } =>
          Boolean(post.id)
        )
        .map(post => ({
          id: post.id,
          label: post.title?.trim() || 'Без названия',
        })),
    [initialPosts]
  );

  const isUrgentActive = extraFilter === 'urgent';

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
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

  const hasActiveSelectFilters = useMemo(() => {
    const hasAssigneeFilter = isManagerAccount
      ? false
      : onlyMyTasks || assigneeAccountId !== 'all';

    return (
      (viewMode === 'grid' && status !== 'all') ||
      (viewMode !== 'table' && postId !== 'all') ||
      (viewMode !== 'table' && executorId !== 'all') ||
      extraFilter !== null ||
      hasAssigneeFilter ||
      updatedDate !== null
    );
  }, [
    viewMode,
    status,
    postId,
    executorId,
    extraFilter,
    onlyMyTasks,
    assigneeAccountId,
    updatedDate,
    isManagerAccount,
  ]);

  const handleResetSelectFilters = () => {
    setStatus('all');
    setPostId('all');
    setExecutorId('all');
    setExtraFilter(null);
    if (!isManagerAccount) {
      setOnlyMyTasks(false);
    }
    setAssigneeAccountId('all');
    setUpdatedDate(null);
  };

  const isTableMode = viewMode === 'table';

  return (
    <>
      <Stack
        ref={ref}
        spacing={2}
        direction="column"
        className="print-no-print"
        sx={{
          p: 4,
          mb: 1,
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
          {['grid', 'kanban'].includes(viewMode) && <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {viewMode === 'grid' && (
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

            {viewMode !== 'table' && (
              <>
                <FilterAutocomplete
                  label="Пост"
                  size="small"
                  value={postId}
                  onChange={setPostId}
                  options={postOptions}
                  sx={{ width: 250, flex: '0 0 250px' }}
                />

                <FilterAutocomplete
                  size="small"
                  value={executorId}
                  options={partnerOptions}
                  onChange={setExecutorId}
                  loading={isPartnersLoading}
                  sx={{ width: 250, flex: '0 0 250px' }}
                  label={isCompany ? 'Исполнитель' : 'Компания'}
                />
              </>
            )}

            {hasActiveSelectFilters && (
              <Chip
                label="Сбросить"
                variant="outlined"
                onClick={handleResetSelectFilters}
                sx={{ flexShrink: 0 }}
              />
            )}
          </Stack>}

          <Stack
            spacing={1}
            direction="row"
            sx={{ alignItems: 'center', justifyContent: isTableMode ? 'space-between' : 'flex-end', width: '100%' }}
          >
            {(isSearchOpen || isTableMode) && (
              <TextField
                size="small"
                label="Поиск"
                variant="outlined"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                sx={{
                  width: { xs: 160, sm: 220, md: isTableMode ? 500 : 250 },
                  transition: 'width .5s ease-in-out',
                }}
              />
            )}

            {!isTableMode && <Tooltip title={isSearchOpen ? 'Скрыть поиск' : 'Показать поиск'}>
              <IconButton
                size="small"
                color={isSearchOpen ? 'primary' : 'default'}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                {isSearchOpen ? (
                  <Close fontSize="small" />
                ) : (
                  <Search fontSize="small" />
                )}
              </IconButton>
            </Tooltip>}

            <TaskFilterActionsMenu
              isCompany={isCompany}
              tableReport={tableReport}
            />
          </Stack>
        </Stack>

        <Divider />

        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flex: 1,
              alignItems: 'center',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <FastButtonGroup isSearchOpen={false} />

            <Tooltip
              title={
                updatedDate ? `Дата: ${updatedDate}` : 'Фильтр по дате создания'
              }
            >
              <span>
                <IconButton
                  size="small"
                  color={updatedDate ? 'primary' : 'default'}
                  onClick={event => setAnchorEl(event.currentTarget)}
                >
                  <CalendarMonthOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={
                isUrgentActive
                  ? 'Показать все задачи'
                  : 'Только срочные задачи'
              }
            >
              <IconButton
                size="small"
                aria-pressed={isUrgentActive}
                onClick={() =>
                  setExtraFilter(isUrgentActive ? null : 'urgent')
                }
              >
                <Whatshot color={isUrgentActive ? 'error' : 'action'} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center', flexShrink: 0 }}
          >

            <AssigneeFilterMenu isCompany={isCompany} />

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

            <TaskViewModeToggle />
          </Stack>
        </Stack>
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
    </>
  );
};
