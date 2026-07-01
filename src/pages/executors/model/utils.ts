import { format, formatDistanceToNow, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

import { USER_ROLE } from '@/entities';

import type { PartnersPageConfig } from './types';

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
