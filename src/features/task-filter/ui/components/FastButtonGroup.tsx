import { More } from '@mui/icons-material';
import { Chip, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

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
};

const FastChip = ({ label, count, isActive, onClick }: FastChipProps) => (
  <Chip
    size="small"
    onClick={onClick}
    color={isActive ? 'primary' : 'default'}
    variant={isActive ? 'filled' : 'outlined'}
    label={count > 0 ? `${label} · ${count}` : label}
    sx={{
      flexShrink: 0,
      cursor: 'pointer',
      borderRadius: '10px',
      fontWeight: isActive ? 600 : 400,
    }}
  />
);

export const FastButtonGroup = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const { role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;

  const { fastButtonValue, setFastButtonValue, postId } =
    useMyTaskFilterStore();

  const fastButtonOptions = useMemo(
    () => getFastButtonOptions(isCompany),
    [isCompany],
  );

  const primaryOptions = fastButtonOptions.slice(0, FAST_BUTTON_PRIMARY_COUNT);
  const menuOptions = fastButtonOptions.slice(FAST_BUTTON_PRIMARY_COUNT);

  const statsParams = useMemo(
    () => (postId !== 'all' ? { postId } : undefined),
    [postId],
  );

  const { data: stats } = useTaskStatsQuery(statsParams);

  const handleFastButtonClick = (value: FastButtonValueType) => {
    setFastButtonValue(fastButtonValue === value ? null : value);
    setMenuAnchorEl(null);
  };

  const getCount = (value: FastButtonValueType) =>
    getTaskStatsCount(value, stats);

  const isMenuFilterActive = useMemo(
    () =>
      fastButtonValue !== null && menuOptions.includes(fastButtonValue),
    [fastButtonValue, menuOptions],
  );

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        gap: 1,
        alignItems: 'center',
        scrollbarWidth: 'none',
        pb: { xs: 0.5, md: 0 },
        flexWrap: { xs: 'nowrap', md: 'wrap' },
        overflowX: { xs: 'auto', md: 'visible' },
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {primaryOptions.map(value => (
        <FastChip
          key={value}
          count={getCount(value)}
          isActive={fastButtonValue === value}
          label={getFastButtonLabel(value)}
          onClick={() => handleFastButtonClick(value)}
        />
      ))}

      {menuOptions.length > 0 && (
        <>
          <IconButton
            color={isMenuFilterActive ? 'primary' : 'default'}
            onClick={event => setMenuAnchorEl(event.currentTarget)}
          >
            <More />
          </IconButton>

          <Menu
            open={!!menuAnchorEl}
            anchorEl={menuAnchorEl}
            onClose={() => setMenuAnchorEl(null)}
          >
            {menuOptions.map(value => (
              <MenuItem
                key={value}
                selected={fastButtonValue === value}
                onClick={() => handleFastButtonClick(value)}
              >
                {getCount(value) > 0
                  ? `${getFastButtonLabel(value)} · ${getCount(value)}`
                  : getFastButtonLabel(value)}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Stack>
  );
};
