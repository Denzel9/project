import { Close, FilterList } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { useEffect, useState } from 'react';

import { useScroll } from '@/shared';

import { DEFAULT_CALENDAR_FILTERS } from '../model/constants';
import { hasActiveCalendarFilters, toCalendarDateKey, type CalendarEvent } from '../model/utils';

import {
  CalendarFilterFields,
} from './CalendarFilterFields';

import type {
  CalendarFiltersState,
  CalendarFilterOption,
} from '../model/types';
import type { Dayjs } from 'dayjs';

type CalendarFiltersProps = {
  selectedDate: Dayjs;
  events: CalendarEvent[];
  isLoading?: boolean;
  value: CalendarFiltersState;
  onChange: (patch: Partial<CalendarFiltersState>) => void;
  onReset: () => void;
  companyOptions: CalendarFilterOption[];
  isCompany: boolean;
  isLoadingCompanies?: boolean;
};

export const CalendarFilters = ({
  selectedDate,
  events,
  isLoading = false,
  value,
  onChange,
  onReset,
  companyOptions,
  isCompany,
  isLoadingCompanies = false,
}: CalendarFiltersProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const isActive = hasActiveCalendarFilters(value);
  const draftHasFilters = hasActiveCalendarFilters(draft);

  const { isScrolled, ref } = useScroll(80);

  const dayEventsCount = events.filter(
    event => event.dateKey === toCalendarDateKey(selectedDate),
  ).length;

  useEffect(() => {
    if (!isDrawerOpen) return;

    setTimeout(() => {
      setDraft(value);
    }, 0);
  }, [isDrawerOpen, value]);

  const handleDraftChange = (patch: Partial<CalendarFiltersState>) => {
    setDraft(current => ({ ...current, ...patch }));
  };

  const handleApply = () => {
    onChange(draft);
    setIsDrawerOpen(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_CALENDAR_FILTERS);
    onReset();
    setIsDrawerOpen(false);
  };

  // TODO сделать в задачах кнопку сгрупировать(пишу тут просто так, сделать нужно в задачах. подумать как визуально отобразить задачи когда они сгрупировались по стопкам)

  const formattedDate = format(selectedDate.toDate(), 'd MMMM yyyy', {
    locale: ru,
  });

  if (isMobile) {
    return (
      <Box ref={ref} sx={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <Stack
          direction="row"
          sx={{
            mb: 1,
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderRadius: '24px',
            alignItems: 'center',
            borderColor: 'divider',
            justifyContent: 'space-between',
            borderTopLeftRadius: isScrolled ? 0 : '24px',
            borderTopRightRadius: isScrolled ? 0 : '24px',
            borderTopColor: isScrolled ? 'transparent' : 'divider',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', minWidth: 0 }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              {formattedDate}
            </Typography>

            {!isLoading && dayEventsCount > 0 && (
              <Chip
                size="small"
                label={dayEventsCount}
              />
            )}
          </Stack>

          <IconButton
            aria-label="Фильтры"
            aria-pressed={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
            color={isActive ? 'primary' : 'default'}
          >
            <FilterList />
          </IconButton>
        </Stack>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              p: 3,
              maxWidth: 420,
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', sm: '80%' },
            },
          }}
        >
          <Stack
            direction="row"
            sx={{
              mb: 3,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">Фильтры</Typography>

            <IconButton
              aria-label="Закрыть"
              onClick={() => setIsDrawerOpen(false)}
            >
              <Close />
            </IconButton>
          </Stack>

          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
            <CalendarFilterFields
              stacked
              value={draft}
              isCompany={isCompany}
              showInlineReset={false}
              onChange={handleDraftChange}
              companyOptions={companyOptions}
              isLoadingCompanies={isLoadingCompanies}
            />
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              pt: 2,
              flexShrink: 0,
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {draftHasFilters && (
              <Button
                variant="outlined"
                onClick={handleReset}
              >
                Сбросить
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleApply}
            >
              Применить
            </Button>
          </Stack>
        </Drawer>
      </Box>
    );
  }

  return (
    <Box ref={ref} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: '24px', bgcolor: 'background.paper', p: 2 }}>
      <CalendarFilterFields
        value={value}
        onChange={onChange}
        onReset={onReset}
        companyOptions={companyOptions}
        isCompany={isCompany}
        isLoadingCompanies={isLoadingCompanies}
      />
    </Box>
  );
};
