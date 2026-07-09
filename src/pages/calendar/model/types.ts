import type { PlacementFormat, Platform } from '@/entities/post';

export type CalendarEventTypeFilter = 'all' | 'created' | 'deadline';

export type CalendarPostMeta = {
  platforms: Platform[];
  placementFormats: PlacementFormat[];
};

export type CalendarFiltersState = {
  eventType: CalendarEventTypeFilter;
  urgentOnly: boolean;
  companyId: 'all' | string;
  platform: Platform | 'all';
  placementFormat: PlacementFormat | 'all';
};

export type CalendarFilterOption = {
  id: string;
  label: string;
};
