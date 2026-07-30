import { format, formatDistanceToNow, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

import { USER_ROLE } from '@/entities';

import type {
  ApplicationCompanyRow,
  ApplicationCompanySortField,
  PartnersPageConfig,
  PartnersSortOrder,
  TaskContactRow,
  TaskContactSortField,
} from './types';

export const formatRelativeTime = (value?: string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  if (!isValid(date)) return '—';

  return formatDistanceToNow(date, { addSuffix: true, locale: ru });
};

export const formatDateTime = (
  value?: string | null,
  pattern = 'dd MMM yyyy',
) => {
  if (!value) return '—';

  const date = new Date(value);

  if (!isValid(date)) return '—';

  return format(date, pattern, { locale: ru });
};

export const getPartnersPageConfig = (role: string | null): PartnersPageConfig => {
  if (role === USER_ROLE.CREATOR) {
    return {
      title: 'Заказчики',
      defaultTab: 'customers',
      tabs: [
        { id: 'customers', label: 'Заказчики' },
        { id: 'companies', label: 'Компании' },
      ],
    };
  }

  return {
    title: 'Пользователи',
    defaultTab: 'executors',
    tabs: [
      { id: 'executors', label: 'Исполнители' },
      { id: 'applicants', label: 'Кандидаты' },
    ],
  };
};

export const DEFAULT_APPLICANT_STATUSES = ['NEW', 'VIEWED'] as const;

const compareOptionalDates = (
  left?: string,
  right?: string,
  direction = 1,
) => {
  const leftTime = left && isValid(new Date(left)) ? new Date(left).getTime() : 0;
  const rightTime =
    right && isValid(new Date(right)) ? new Date(right).getTime() : 0;

  return (leftTime - rightTime) * direction;
};

export const sortTaskContactRows = (
  items: TaskContactRow[],
  sortField: TaskContactSortField,
  sortOrder: PartnersSortOrder,
) => {
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...items].sort((left, right) => {
    switch (sortField) {
      case 'name':
        return left.name.localeCompare(right.name, 'ru') * direction;
      case 'interactionsCount':
        return (left.interactionsCount - right.interactionsCount) * direction;
      case 'publicationsCount':
        return (left.publicationsCount - right.publicationsCount) * direction;
      case 'lastInteractionAt':
        return compareOptionalDates(
          left.lastInteractionAt,
          right.lastInteractionAt,
          direction,
        );
      default:
        return 0;
    }
  });
};

export const sortApplicationCompanyRows = (
  items: ApplicationCompanyRow[],
  sortField: ApplicationCompanySortField,
  sortOrder: PartnersSortOrder,
) => {
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...items].sort((left, right) => {
    switch (sortField) {
      case 'name':
        return left.name.localeCompare(right.name, 'ru') * direction;
      case 'applicationsCount':
        return (left.applicationsCount - right.applicationsCount) * direction;
      case 'postsCount':
        return (left.postsCount - right.postsCount) * direction;
      case 'lastActivityAt':
        return compareOptionalDates(
          left.lastActivityAt,
          right.lastActivityAt,
          direction,
        );
      default:
        return 0;
    }
  });
};
