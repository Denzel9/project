import { Whatshot } from '@mui/icons-material';
import { Chip, IconButton, MenuItem, Stack, TextField } from '@mui/material';

import {
  AssigneeFilterMenu
} from '@/features';
import { FilterAutocomplete } from '@/shared';

import { hasActiveCalendarFilters } from '../model/utils';

import type {
  CalendarFiltersState,
  CalendarFilterOption,
} from '../model/types';

const SELECT_WIDTH = 240;


type CalendarFilterFieldsProps = {
  value: CalendarFiltersState;
  onChange: (patch: Partial<CalendarFiltersState>) => void;
  onReset?: () => void;
  companyOptions: CalendarFilterOption[];
  isCompany: boolean;
  isLoadingCompanies: boolean;
  stacked?: boolean;
  showInlineReset?: boolean;
};

export const CalendarFilterFields = ({
  value,
  onChange,
  onReset,
  companyOptions,
  isCompany,
  isLoadingCompanies,
  stacked = false,
  showInlineReset = true,
}: CalendarFilterFieldsProps) => {
  const companyLabel = isCompany ? 'Исполнитель' : 'Компания';
  const showReset =
    showInlineReset && onReset && hasActiveCalendarFilters(value);

  return (
    <Stack
      spacing={stacked ? 2 : 0}
      direction={stacked ? 'column' : 'row'}
      useFlexGap={!stacked}
      sx={
        stacked
          ? undefined
          : { flexWrap: 'wrap', alignItems: 'center', gap: 2, justifyContent: 'space-between' }
      }
    ><Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        ...(stacked && { pt: 0.5 }),
      }}
    >
        <TextField
          select
          fullWidth={stacked}
          size="small"
          label="Тип событий"
          value={value.eventType}
          sx={stacked ? undefined : { width: SELECT_WIDTH }}
          onChange={event =>
            onChange({
              eventType: event.target.value as CalendarFiltersState['eventType'],
            })
          }
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="created">Создано в этот день</MenuItem>
          <MenuItem value="deadline">Дедлайн в этот день</MenuItem>
        </TextField>

        <FilterAutocomplete
          size="small"
          label={companyLabel}
          value={value.companyId}
          options={companyOptions}
          loading={isLoadingCompanies}
          onChange={companyId => onChange({ companyId })}
          sx={stacked ? undefined : { width: SELECT_WIDTH, flex: '0 0 auto' }}
        />


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
          <Chip
            label="Сбросить"
            variant="outlined"
            onClick={onReset}
            sx={{ flexShrink: 0 }}
          />
        )}
      </Stack>

      <AssigneeFilterMenu isCompany={isCompany} />
    </Stack>
  );
};
