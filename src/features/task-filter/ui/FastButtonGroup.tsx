import { Chip, Stack } from '@mui/material';

import { useMyTaskFilterStore } from '../model/store';
import {
  FAST_BUTTON_OPTIONS,
  filterTasksByExecutorApprove,
  getFastButtonLabel,
} from '../model/utils';

import type { FastButtonValueType } from '../model/utils';
import type { Task } from '@/entities';

type FastButtonGroupProps = {
  tasks: Task[];
  isCompany: boolean;
};

type FastChipProps = {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
};

const FastChip = ({ label, count, isActive, onClick }: FastChipProps) => (
  <Chip
    size="small"
    label={count > 0 ? `${label} · ${count}` : label}
    onClick={onClick}
    color={isActive ? 'primary' : 'default'}
    variant={isActive ? 'filled' : 'outlined'}
    sx={{
      flexShrink: 0,
      borderRadius: '10px',
      fontWeight: isActive ? 600 : 400,
      cursor: 'pointer',
    }}
  />
);

export const FastButtonGroup = ({ tasks, isCompany }: FastButtonGroupProps) => {
  const {
    status,
    postId,
    viewMode,
    fastButtonValue,
    setStatus,
    setPostId,
    setFastButtonValue,
  } = useMyTaskFilterStore();

  const isFastFilterLocked =
    postId !== 'all' || (viewMode !== 'kanban' && status !== 'all');

  const handleFastButtonClick = (value: FastButtonValueType) => {
    if (isFastFilterLocked) {
      setStatus('all');
      setPostId('all');
    }

    setFastButtonValue(value);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        gap: 1,
        flexWrap: { xs: 'nowrap', md: 'wrap' },
        overflowX: { xs: 'auto', md: 'visible' },
        pb: { xs: 0.5, md: 0 },
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {FAST_BUTTON_OPTIONS.map(value => (
        <FastChip
          key={value}
          label={getFastButtonLabel(value)}
          onClick={() => handleFastButtonClick(value)}
          isActive={!isFastFilterLocked && fastButtonValue === value}
          count={filterTasksByExecutorApprove(tasks, value, isCompany).length}
        />
      ))}
    </Stack>
  );
};
