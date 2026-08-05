import { getUserName, type User } from '@/entities/user';

import type { MyResponseSortField, MyResponseSortOrder } from './types';
import type {
  Application,
  ApplicationListParams,
  ApplicationStatus,
} from '@/entities';

export type ApplicationStatusFilter = ApplicationStatus | 'all';
export type CompanyFilter = 'all' | string;

export const filterApplicationsByCompany = (
  applications: Application[],
  companyId: CompanyFilter,
) => {
  if (companyId === 'all') return applications;

  return applications.filter(
    application =>
      (application.post?.ownerId ?? application.post?.owner?.id) === companyId,
  );
};

export const toMyApplicationsParams = (
  filters: {
    status: ApplicationStatusFilter;
    updatedDate: string | null;
    q?: string;
  },
  pagination?: { page?: number; limit?: number },
): ApplicationListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.updatedDate && { createdDate: filters.updatedDate }),
  ...(filters.q?.trim() && { q: filters.q.trim() }),
});

export const hasActiveMyResponseFilters = (filters: {
  status: ApplicationStatusFilter;
  updatedDate: string | null;
  companyId: CompanyFilter;
  q?: string;
}) =>
  filters.status !== 'all' ||
  Boolean(filters.updatedDate) ||
  filters.companyId !== 'all' ||
  Boolean(filters.q?.trim());

export const countApplicationsByStatus = (applications: Application[]) => {
  const counts: Record<'all' | ApplicationStatus, number> = {
    all: applications.length,
    NEW: 0,
    VIEWED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  applications.forEach(application => {
    counts[application.status] += 1;
  });

  return counts;
};

const getCompanySortValue = (application: Application) =>
  getUserName(application.post?.owner as Partial<User> | undefined)?.toLowerCase();

const getPostSortValue = (application: Application) =>
  (application.post?.title ?? '').toLowerCase();

const compareStrings = (a: string, b: string) => a.localeCompare(b, 'ru');

export const sortMyResponses = (
  applications: Application[],
  field: MyResponseSortField,
  order: MyResponseSortOrder,
) => {
  const direction = order === 'asc' ? 1 : -1;

  return [...applications].sort((left, right) => {
    // eslint-disable-next-line no-useless-assignment
    let result = 0;

    switch (field) {
      case 'post':
        result = compareStrings(getPostSortValue(left), getPostSortValue(right));
        break;
      case 'company':
        result = compareStrings(
          getCompanySortValue(left) ?? '',
          getCompanySortValue(right) ?? '',
        );
        break;
      case 'status':
        result = compareStrings(left.status, right.status);
        break;
      case 'createdAt':
        result =
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime();
        break;
      case 'updatedAt':
        result =
          new Date(left.updatedAt).getTime() -
          new Date(right.updatedAt).getTime();
        break;
      default:
        result = 0;
    }

    return result * direction;
  });
};

export const getMyResponseStatusColor = (status: Application['status']) => {
  if (status === 'ACCEPTED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'WITHDRAWN') return 'default';
  if (status === 'VIEWED') return 'info';
  return 'primary';
};
