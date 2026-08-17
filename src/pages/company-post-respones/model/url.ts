import {
  areSearchParamsEqual,
  isEmptyFilterValue,
  setSearchParam,
} from '@/shared/lib/url-filters';

import {
  APPLICATION_STATUS_VALUES,
  DEFAULT_APPLICATION_STATUS_FILTER,
  isDefaultApplicationStatusFilter,
  type ApplicationPostTypeFilter,
  type ApplicationStatusFilter,
} from './utils';

export type IncomingApplicationUrlFilters = {
  q: string;
  postId: string;
  userId: string;
  type: ApplicationPostTypeFilter;
  status: ApplicationStatusFilter;
  updatedDate: string | null;
};

const FILTER_KEYS = ['q', 'postId', 'userId', 'type', 'status', 'date'] as const;
const POST_TYPES = new Set<ApplicationPostTypeFilter>([
  'CREATOR',
  'COMPANY',
  'all',
]);

const parseId = (value: string | null) =>
  isEmptyFilterValue(value) ? 'all' : value!;

export const parseIncomingApplicationSearchParams = (
  searchParams: URLSearchParams,
): IncomingApplicationUrlFilters => {
  const type = searchParams.get('type');
  const statusFromUrl = searchParams.get('status');
  const parsedStatus = !statusFromUrl
    ? [...DEFAULT_APPLICATION_STATUS_FILTER]
    : statusFromUrl === 'all'
      ? []
      : statusFromUrl
          .split(',')
          .map(item => item.trim())
          .filter((item): item is ApplicationStatusFilter[number] =>
            APPLICATION_STATUS_VALUES.includes(
              item as ApplicationStatusFilter[number],
            ),
          );

  return {
    q: searchParams.get('q') ?? '',
    postId: parseId(searchParams.get('postId')),
    userId: parseId(searchParams.get('userId')),
    type:
      type && POST_TYPES.has(type as ApplicationPostTypeFilter)
        ? (type as ApplicationPostTypeFilter)
        : 'all',
    status: parsedStatus,
    updatedDate: searchParams.get('date'),
  };
};

export const writeIncomingApplicationSearchParams = (
  current: URLSearchParams,
  filters: IncomingApplicationUrlFilters,
) => {
  const next = new URLSearchParams(current);

  for (const key of FILTER_KEYS) {
    next.delete(key);
  }

  setSearchParam(next, 'q', filters.q.trim() || null);
  setSearchParam(next, 'postId', filters.postId);
  setSearchParam(next, 'userId', filters.userId);
  setSearchParam(next, 'type', filters.type);
  setSearchParam(
    next,
    'status',
    isDefaultApplicationStatusFilter(filters.status)
      ? null
      : filters.status.length === 0
        ? 'all'
        : filters.status.join(','),
  );
  setSearchParam(next, 'date', filters.updatedDate);

  return next;
};

export const incomingApplicationSearchParamsEqual = (
  left: URLSearchParams,
  right: URLSearchParams,
) => areSearchParamsEqual(left, right);
