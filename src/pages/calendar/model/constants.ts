import type { CalendarFiltersState } from './types';

export const CALENDAR_DAY_EVENTS_PAGE_SIZE = 20;

export const DEFAULT_CALENDAR_FILTERS: CalendarFiltersState = {
  eventType: 'all',
  urgentOnly: false,
  companyId: 'all',
  platform: 'all',
  placementFormat: 'all',
};
