import { Box } from '@mui/material';

import { TaskTable } from '@/pages/my-tasks/ui/TaskTable';

import { DashboardSection } from './DashboardSection';

import type { Task } from '@/entities';

type DashboardUpcomingTasksTableProps = {
  tasks: Task[];
  isLoading?: boolean;
};

export const DashboardUpcomingTasksTable = ({
  tasks,
  isLoading = false,
}: DashboardUpcomingTasksTableProps) => (
  <DashboardSection
    title="Задачи"
    skeletonCount={5}
    count={tasks.length}
    isLoading={isLoading}
    isEmpty={!isLoading && tasks.length === 0}
    emptyText="Нет задач с дедлайном на сегодня и ожидающих вашего действия"
  >
    <Box>
      <TaskTable
        embedded
        tasks={tasks}
      />
    </Box>
  </DashboardSection>
);
