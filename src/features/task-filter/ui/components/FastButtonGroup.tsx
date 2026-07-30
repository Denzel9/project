import { Chip, Stack, type SxProps, type Theme } from '@mui/material';
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
      bgcolor: isActive ? 'primary.main' : 'white',
      ':hover': {
        bgcolor: isActive ? 'primary.dark' : '#f0f0f0 !important',
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

  const { fastButtonValue, setFastButtonValue, postId } =
    useMyTaskFilterStore();

  const fastButtonOptions = useMemo(
    () => getFastButtonOptions(isCompany),
    [isCompany]
  );

  const primaryOptions = fastButtonOptions.slice(0, FAST_BUTTON_PRIMARY_COUNT);
  const menuOptions = fastButtonOptions.slice(FAST_BUTTON_PRIMARY_COUNT);

  const statsParams = useMemo(
    () => (postId !== 'all' ? { postId } : undefined),
    [postId]
  );

  const { data: stats } = useTaskStatsQuery(statsParams);

  const handleFastButtonClick = (value: FastButtonValueType) => {
    setFastButtonValue(fastButtonValue === value ? null : value);
    // setMenuAnchorEl(null);
  };

  const getCount = (value: FastButtonValueType) =>
    getTaskStatsCount(value, stats);

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        width: 'fit-content',
        alignItems: 'center',
        scrollbarWidth: 'none',
        pb: { xs: 0.5, md: 0 },
        flexWrap: { xs: 'nowrap', md: 'nowrap' },
        overflowX: { xs: 'auto', md: 'visible' },
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {primaryOptions.map((value, index) => (
        <FastChip
          sx={{ ml: isSearchOpen ? (index > 0 ? '-30px !important' : 0) : 0 }}
          key={value}
          count={getCount(value)}
          label={getFastButtonLabel(value)}
          isActive={fastButtonValue === value}
          onClick={() => handleFastButtonClick(value)}
        />
      ))}

      {menuOptions.map((value, index) => {
        if (value === 'urgent') return null;

        return (
          <FastChip
            sx={{ ml: isSearchOpen ? '-30px !important' : 0, zIndex: index }}
            key={value}
            count={getCount(value)}
            label={getFastButtonLabel(value)}
            isActive={fastButtonValue === value}
            onClick={() => handleFastButtonClick(value)}
          />
        );
      })}
    </Stack>
  );
};
