import { FilterList, Whatshot } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';

import {
  TASK_STATUS_LABELS,
  useTasksQuery,
  type TaskStatus,
} from '@/entities';
import {
  getPartnerName,
  mapPartnerUserToRow,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities/partner';
import { COLUMN_FILTER_SEARCH_MIN } from '@/pages/my-tasks/model/constants/constants';
import { getTaskTitle } from '@/pages/my-tasks/model/utils/utils';
import { FilterAutocomplete, FilterStatusSelect, type FilterAutocompleteOption } from '@/shared';

type DashboardUpcomingCardsFilterProps = {
  isCompany: boolean;
  open: boolean;
  taskId: string;
  personId: string;
  status: TaskStatus[];
  urgentOnly: boolean;
  onTaskIdChange: (taskId: string) => void;
  onPersonIdChange: (personId: string) => void;
  onStatusChange: (status: TaskStatus[]) => void;
  onUrgentOnlyChange: (urgentOnly: boolean) => void;
  onReset: () => void;
};

const STATUS_OPTIONS = Object.entries(TASK_STATUS_LABELS).map(
  ([value, label]) => ({ value: value as TaskStatus, label }),
);

export const DashboardUpcomingCardsFilterToggle = ({
  open,
  hasActiveFilters,
  onClick,
}: {
  open: boolean;
  hasActiveFilters: boolean;
  onClick: () => void;
}) => (
  <IconButton
    size="small"
    aria-label="Фильтры"
    onClick={onClick}
    sx={{
      color:
        open || hasActiveFilters ? 'primary.main' : 'text.secondary',
    }}
  >
    <FilterList />
  </IconButton>
);

export const DashboardUpcomingCardsFilter = ({
  isCompany,
  open,
  taskId,
  personId,
  status,
  urgentOnly,
  onTaskIdChange,
  onPersonIdChange,
  onStatusChange,
  onUrgentOnlyChange,
  onReset,
}: DashboardUpcomingCardsFilterProps) => {
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedTaskOption, setSelectedTaskOption] =
    useState<FilterAutocompleteOption | null>(null);
  const [selectedPersonOption, setSelectedPersonOption] =
    useState<FilterAutocompleteOption | null>(null);

  const canSearchTasks = taskSearch.trim().length >= COLUMN_FILTER_SEARCH_MIN;

  const { data: tasksData, isFetching: isTasksLoading } = useTasksQuery(
    {
      page: 1,
      limit: 20,
      role: isCompany ? 'owner' : 'executor',
      q: taskSearch.trim(),
    },
    { enabled: open && canSearchTasks }
  );

  const { data: executorsData, isLoading: isExecutorsLoading } =
    usePartnerExecutorsQuery(
      { sort: 'name', limit: 100 },
      { enabled: open && isCompany }
    );
  const { data: customersData, isLoading: isCustomersLoading } =
    usePartnerCustomersQuery(
      { sort: 'name', limit: 100 },
      { enabled: open && !isCompany }
    );

  const taskOptions = useMemo(
    () =>
      (tasksData?.items ?? []).map(task => ({
        id: task.id,
        label: getTaskTitle(task),
      })),
    [tasksData?.items]
  );

  const personOptions = useMemo(() => {
    const items = isCompany
      ? (executorsData?.items ?? [])
      : (customersData?.items ?? []);

    return items.map(item => ({
      id: item.id,
      label: isCompany ? mapPartnerUserToRow(item).name : getPartnerName(item),
    }));
  }, [customersData?.items, executorsData?.items, isCompany]);

  const personLabel = isCompany ? 'Исполнитель' : 'Заказчик';
  const isPersonsLoading = isCompany ? isExecutorsLoading : isCustomersLoading;

  const hasActiveFilters =
    taskId !== 'all' ||
    personId !== 'all' ||
    status.length > 0 ||
    urgentOnly;

  const selectedTaskTitle =
    selectedTaskOption?.id === taskId
      ? selectedTaskOption.label
      : taskOptions.find(option => option.id === taskId)?.label;

  const selectedPersonTitle =
    selectedPersonOption?.id === personId
      ? selectedPersonOption.label
      : personOptions.find(option => option.id === personId)?.label;

  const handleReset = () => {
    setSelectedTaskOption(null);
    setSelectedPersonOption(null);
    setTaskSearch('');
    onReset();
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        mb: 1.5,
        p: 1.25,
        flexShrink: 0,
        borderRadius: '16px',
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        useFlexGap
        sx={{ alignItems: { sm: 'center' }, flexWrap: 'wrap' }}
      >
        <FilterAutocomplete
          size="small"
          label="Название"
          value={taskId}
          options={taskOptions}
          selectedOption={selectedTaskOption}
          loading={canSearchTasks && isTasksLoading}
          minInputLength={COLUMN_FILTER_SEARCH_MIN}
          onSearch={setTaskSearch}
          onChange={id => {
            if (id === 'all') {
              setSelectedTaskOption(null);
              onTaskIdChange('all');
              return;
            }

            const option =
              taskOptions.find(item => item.id === id) ?? selectedTaskOption;
            setSelectedTaskOption(option);
            onTaskIdChange(id);
          }}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 160 } }}
        />

        <FilterAutocomplete
          size="small"
          label={personLabel}
          value={personId}
          options={personOptions}
          selectedOption={selectedPersonOption}
          loading={isPersonsLoading}
          onChange={id => {
            if (id === 'all') {
              setSelectedPersonOption(null);
              onPersonIdChange('all');
              return;
            }

            const option =
              personOptions.find(item => item.id === id) ??
              selectedPersonOption;
            setSelectedPersonOption(option);
            onPersonIdChange(id);
          }}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 160 } }}
        />

        <FilterStatusSelect
          size="small"
          value={status}
          options={STATUS_OPTIONS}
          onChange={onStatusChange}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
        />

        <Tooltip
          title={urgentOnly ? 'Показать все задачи' : 'Только срочные задачи'}
        >
          <IconButton
            size="small"
            aria-label="Только срочные"
            aria-pressed={urgentOnly}
            onClick={() => onUrgentOnlyChange(!urgentOnly)}
            sx={{
              flexShrink: 0,
              color: urgentOnly ? 'error.main' : 'text.secondary',
            }}
          >
            <Whatshot />
          </IconButton>
        </Tooltip>
      </Stack>

      {hasActiveFilters && (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ mt: 1.25, flexWrap: 'wrap', gap: 0.75 }}
        >
          {taskId !== 'all' && selectedTaskTitle && (
            <Chip
              label={selectedTaskTitle}
              onDelete={() => {
                setSelectedTaskOption(null);
                onTaskIdChange('all');
              }}
            />
          )}

          {personId !== 'all' && selectedPersonTitle && (
            <Chip
              label={`${personLabel}: ${selectedPersonTitle}`}
              onDelete={() => {
                setSelectedPersonOption(null);
                onPersonIdChange('all');
              }}
            />
          )}

          {status.map(item => (
            <Chip
              key={item}
              label={TASK_STATUS_LABELS[item] ?? item}
              onDelete={() =>
                onStatusChange(status.filter(value => value !== item))
              }
            />
          ))}

          {urgentOnly && (
            <Chip
              label="Срочные"
              onDelete={() => onUrgentOnlyChange(false)}
            />
          )}

          <Chip
            label="Сбросить"
            variant="outlined"
            onClick={handleReset}
            sx={{ flexShrink: 0 }}
          />
        </Stack>
      )}
    </Box>
  );
};
