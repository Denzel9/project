import { useCallback } from 'react';

import { type Task } from '@/entities';
import {
  MAX_SELECTED_TASKS,
  useMyTaskFilterStore,
} from '@/features';
import { useSnackbarStore } from '@/widgets';

export const useTaskSelectionToggle = () => {
  const isTaskSelectionMode = useMyTaskFilterStore(
    state => state.isTaskSelectionMode,
  );
  const selectedTaskIds = useMyTaskFilterStore(state => state.selectedTaskIds);
  const toggleTaskSelection = useMyTaskFilterStore(
    state => state.toggleTaskSelection,
  );
  const { setSnackbarOpen } = useSnackbarStore();

  const onToggleSelection = useCallback(
    (task: Task) => {
      const didToggle = toggleTaskSelection(task);
      if (!didToggle) {
        setSnackbarOpen(
          true,
          `Можно выбрать максимум ${MAX_SELECTED_TASKS} задач`,
          'error',
        );
      }
    },
    [toggleTaskSelection, setSnackbarOpen],
  );

  const isSelected = useCallback(
    (taskId: string) => selectedTaskIds.includes(taskId),
    [selectedTaskIds],
  );

  return {
    isTaskSelectionMode,
    selectedTaskIds,
    isSelected,
    onToggleSelection,
  };
};
