import { AssignmentOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { useTaskTableColumnFilters } from '@/pages/my-tasks/model/utils/useTaskTableColumnFilters';
import {
  TaskTable,
} from '@/pages/my-tasks/ui/TaskTable';

import {
  DASHBOARD_TABLE_PAGE_SIZE,
  MOBILE_DASHBOARD_TABLE_PAGE_SIZE,
} from '../model/constants';

import type { TaskTableListState } from '@/pages/my-tasks/model/types/types';

type DashboardUpcomingTasksTableProps = {
  isCompany: boolean;
  onErrorChange?: (isError: boolean) => void;
};

export const DashboardUpcomingTasksTable = ({
  isCompany,
  onErrorChange,
}: DashboardUpcomingTasksTableProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const { columnFilters, hasActiveFilters, resetFilters } =
    useTaskTableColumnFilters({ isCompany });

  const [listState, setListState] = useState<TaskTableListState>({
    total: 0,
    isLoading: true,
    isError: false,
    isEmpty: true,
  });

  const handleListStateChange = useCallback((state: TaskTableListState) => {
    setListState(state);
  }, []);

  useEffect(() => {
    onErrorChange?.(listState.isError);
  }, [listState.isError, onErrorChange]);

  const emptyText = hasActiveFilters
    ? 'Нет задач по выбранным фильтрам'
    : 'Нет задач с дедлайном на сегодня и ожидающих вашего действия';

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        height: { xs: 'auto', lg: 600 },
        minHeight: { xs: 420, lg: 600 },
        display: 'flex',
        bgcolor: 'white',
        overflow: 'hidden',
        p: { xs: 2, md: 2.5 },
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'secondary.light',
              color: 'primary.main',
            }}
          >
            <AssignmentOutlined fontSize="small" />
          </Box>

          <Stack
            spacing={0}
            sx={{ minWidth: 0 }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
            >
              <Typography
                variant="h6"
                sx={{ lineHeight: 1.2 }}
              >
                Текущие задачи
              </Typography>

              {!listState.isLoading &&
                !listState.isError &&
                listState.total > 0 && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={String(listState.total)}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  />
                )}
            </Stack>
          </Stack>
        </Stack>

        {hasActiveFilters && (
          <Button
            size="small"
            onClick={resetFilters}
            sx={{ px: 2 }}
          >
            Сбросить фильтры
          </Button>
        )}
      </Stack>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          '& .MuiTable-root': {
            minWidth: 720,
          },
        }}
      >
        <TaskTable
          embedded
          querySource="dashboard"
          isCompany={isCompany}
          emptyText={emptyText}
          onListStateChange={handleListStateChange}
          rowsPerPage={
            isMobile
              ? MOBILE_DASHBOARD_TABLE_PAGE_SIZE
              : DASHBOARD_TABLE_PAGE_SIZE
          }
          columnFilters={columnFilters}
        />
      </Box>
    </Box>
  );
};
