import { Close, Whatshot } from '@mui/icons-material';
import { Button, IconButton, MenuItem, Stack, TextField } from '@mui/material';

import {
  PlacementFormatEnum,
  PlatformEnum,
  getPlacementFormatLabel,
  getPlatformLabel,
} from '@/entities/post';

import { DEFAULT_CALENDAR_FILTERS } from '../model/constants';

import type {
  CalendarFiltersState,
  CalendarFilterOption,
} from '../model/types';

type CalendarFiltersProps = {
  value: CalendarFiltersState;
  onChange: (patch: Partial<CalendarFiltersState>) => void;
  onReset: () => void;
  companyOptions: CalendarFilterOption[];
  isCompany: boolean;
  isLoadingCompanies?: boolean;
};

const SELECT_WIDTH = 240;

const PLATFORM_OPTIONS = Object.values(PlatformEnum);
const PLACEMENT_FORMAT_OPTIONS = Object.values(PlacementFormatEnum);

const hasActiveFilters = (value: CalendarFiltersState) =>
  value.eventType !== DEFAULT_CALENDAR_FILTERS.eventType ||
  value.urgentOnly !== DEFAULT_CALENDAR_FILTERS.urgentOnly ||
  value.companyId !== DEFAULT_CALENDAR_FILTERS.companyId ||
  value.platform !== DEFAULT_CALENDAR_FILTERS.platform ||
  value.placementFormat !== DEFAULT_CALENDAR_FILTERS.placementFormat;

export const CalendarFilters = ({
  value,
  onChange,
  onReset,
  companyOptions,
  isCompany,
  isLoadingCompanies = false,
}: CalendarFiltersProps) => {
  const companyLabel = isCompany ? 'Исполнитель' : 'Компания';
  const showReset = hasActiveFilters(value);

  return (
    <Stack
      spacing={1}
      sx={{ mb: 2, mt: 1, px: 2 }}
    >
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'center' }}
      >
        <TextField
          select
          size="small"
          label="Тип событий"
          value={value.eventType}
          sx={{ width: SELECT_WIDTH }}
          onChange={event =>
            onChange({
              eventType: event.target
                .value as CalendarFiltersState['eventType'],
            })
          }
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="created">Создана</MenuItem>
          <MenuItem value="deadline">Дедлайн</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label={companyLabel}
          value={value.companyId}
          disabled={isLoadingCompanies}
          sx={{ width: SELECT_WIDTH }}
          onChange={event => onChange({ companyId: event.target.value })}
        >
          <MenuItem value="all">Все</MenuItem>
          {companyOptions.map(option => (
            <MenuItem
              key={option.id}
              value={option.id}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Платформа"
          value={value.platform}
          disabled={!isCompany}
          sx={{ width: SELECT_WIDTH }}
          onChange={event =>
            onChange({
              platform: event.target.value as CalendarFiltersState['platform'],
            })
          }
        >
          <MenuItem value="all">Все</MenuItem>
          {PLATFORM_OPTIONS.map(platform => (
            <MenuItem
              key={platform}
              value={platform}
            >
              {getPlatformLabel(platform)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Тип контента"
          value={value.placementFormat}
          disabled={!isCompany}
          sx={{ width: SELECT_WIDTH }}
          onChange={event =>
            onChange({
              placementFormat: event.target
                .value as CalendarFiltersState['placementFormat'],
            })
          }
        >
          <MenuItem value="all">Все</MenuItem>
          {PLACEMENT_FORMAT_OPTIONS.map(format => (
            <MenuItem
              key={format}
              value={format}
            >
              {getPlacementFormatLabel(format)}
            </MenuItem>
          ))}
        </TextField>

        <IconButton
          aria-label={
            value.urgentOnly ? 'Показать все задачи' : 'Только срочные задачи'
          }
          aria-pressed={value.urgentOnly}
          onClick={() => onChange({ urgentOnly: !value.urgentOnly })}
        >
          <Whatshot color={value.urgentOnly ? 'error' : 'action'} />
        </IconButton>

        {showReset && (
          <Button
            size="small"
            startIcon={<Close />}
            onClick={onReset}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap', px: 2 }}
          >
            Сбросить
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
