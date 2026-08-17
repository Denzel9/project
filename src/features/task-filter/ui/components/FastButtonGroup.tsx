import {
  Chip,
  MenuItem,
  Stack,
  TextField,
  type SxProps,
  type Theme,
} from '@mui/material';
import { useMemo } from 'react';

import { getTaskStatsCount, USER_ROLE, useTaskStatsQuery } from '@/entities';
import { useAuthStore } from '@/features';

import { useMyTaskFilterStore } from '../../model/store';
import {
  FAST_BUTTON_PRIMARY_COUNT,
  getFastButtonLabel,
  getFastButtonOptions,
} from '../../model/utils';

import type { FastButtonValueType } from '../../model/utils';

type FastChipProps = {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  sx?: SxProps<Theme>;
};

const FastChip = ({ label, count, isActive, onClick, sx }: FastChipProps) => (
  <Chip
    sx={{
      transition: 'all 0.1s ease-in-out',
      bgcolor: isActive ? 'primary.main' : 'background.paper',
      ':hover': {
        bgcolor: isActive ? 'primary.dark' : 'action.hover',
      },
      ...sx,
    }}
    clickable
    onClick={onClick}
    color={isActive ? 'primary' : 'default'}
    variant={isActive ? 'filled' : 'outlined'}
    label={count > 0 ? `${label} · ${count}` : label}
  />
);

export const FastButtonGroup = ({
  isSearchOpen,
}: {
  isSearchOpen: boolean;
}) => {
  const { role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;

  const {
    fastButtonValue,
    setFastButtonValue,
    postId,
    onlyMyTasks,
    assigneeAccountId,
  } = useMyTaskFilterStore();

  const fastButtonOptions = useMemo(
    () => getFastButtonOptions(isCompany),
    [isCompany]
  );

  const primaryOptions = fastButtonOptions.slice(0, FAST_BUTTON_PRIMARY_COUNT);
  const menuOptions = fastButtonOptions.slice(FAST_BUTTON_PRIMARY_COUNT);

  const statsParams = useMemo(() => {
    const params: {
      postId?: string;
      assigneeMine?: boolean;
      assigneeAccountId?: string;
    } = {};

    if (postId !== 'all') {
      params.postId = postId;
    }

    // Счётчики должны совпадать с активным фильтром ответственного
    if (onlyMyTasks) {
      params.assigneeMine = true;
    } else if (assigneeAccountId !== 'all') {
      params.assigneeAccountId = assigneeAccountId;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }, [postId, onlyMyTasks, assigneeAccountId]);

  const { data: stats } = useTaskStatsQuery(statsParams);

  const handleFastButtonClick = (value: FastButtonValueType) => {
    setFastButtonValue(fastButtonValue === value ? null : value);
  };

  const getCount = (value: FastButtonValueType) =>
    getTaskStatsCount(value, stats);

  const visibleSelectOptions = fastButtonOptions.filter(value => {
    if (value === 'urgent') return false;

    const count = getCount(value);
    return count > 0 || fastButtonValue === value;
  });

  return (
    <>
      <TextField
        select
        size="small"
        label="Быстрый фильтр"
        value={fastButtonValue ?? 'all'}
        onChange={event => {
          const next = event.target.value;
          setFastButtonValue(
            next === 'all' ? null : (next as FastButtonValueType),
          );
        }}
        sx={{
          display: { xs: 'flex', md: 'none' },
          minWidth: 160,
          flex: 1,
          maxWidth: 180,
        }}
      >
        <MenuItem value="all">Все</MenuItem>
        {visibleSelectOptions.map(value => {
          const count = getCount(value);
          const label = getFastButtonLabel(value);

          return (
            <MenuItem
              key={value}
              value={value}
            >
              {count > 0 ? `${label} · ${count}` : label}
            </MenuItem>
          );
        })}
      </TextField>

      <Stack
        spacing={1}
        direction="row"
        sx={{
          display: { xs: 'none', md: 'flex' },
          ml: '0px !important',
          width: 'fit-content',
          alignItems: 'center',
          scrollbarWidth: 'none',
          flexWrap: 'nowrap',
          overflowX: 'visible',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {primaryOptions.map((value, index) => {
          const count = getCount(value);
          const isActive = fastButtonValue === value;

          if (count <= 0 && !isActive) return null;

          return (
            <FastChip
              key={value}
              count={count}
              label={getFastButtonLabel(value)}
              isActive={isActive}
              onClick={() => handleFastButtonClick(value)}
              sx={{
                ml: isSearchOpen ? (index > 0 ? '-30px !important' : 0) : 0,
              }}
            />
          );
        })}

        {menuOptions.map((value, index) => {
          if (value === 'urgent') return null;

          const count = getCount(value);
          const isActive = fastButtonValue === value;

          if (count <= 0 && !isActive) return null;

          return (
            <FastChip
              key={value}
              count={count}
              label={getFastButtonLabel(value)}
              isActive={isActive}
              onClick={() => handleFastButtonClick(value)}
              sx={{ ml: isSearchOpen ? '-30px !important' : 0, zIndex: index }}
            />
          );
        })}
      </Stack>
    </>
  );
};
