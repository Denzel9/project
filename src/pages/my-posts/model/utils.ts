import { getPartnerName } from '@/entities';

import type { ApplicationSortField, ApplicationSortOrder } from './types';
import type {
  Application,
  ApplicationListParams,
  ApplicationStatus,
} from '@/entities';

export type ApplicationStatusFilter = ApplicationStatus | 'all';

export type ApplicationPostTypeFilter = 'CREATOR' | 'COMPANY' | 'all';

export const toIncomingApplicationsParams = (
  filters: {
    status: ApplicationStatusFilter;
    updatedDate: string | null;
    q?: string;
    postId?: string;
    userId?: string;
    type?: ApplicationPostTypeFilter;
  },
  pagination?: { page?: number; limit?: number },
): ApplicationListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.updatedDate && { createdDate: filters.updatedDate }),
  ...(filters.q?.trim() && { q: filters.q.trim() }),
  ...(filters.postId && filters.postId !== 'all' && { postId: filters.postId }),
  ...(filters.userId && filters.userId !== 'all' && { userId: filters.userId }),
  ...(filters.type && filters.type !== 'all' && { type: filters.type }),
});

const getApplicantSortValue = (application: Application) =>
  getPartnerName(application.applicant).toLowerCase();

const getPostSortValue = (application: Application) =>
  (application.post?.title ?? '').toLowerCase();

const compareStrings = (a: string, b: string) => a.localeCompare(b, 'ru');

export const sortApplications = (
  applications: Application[],
  field: ApplicationSortField,
  order: ApplicationSortOrder,
) => {
  const direction = order === 'asc' ? 1 : -1;

  return [...applications].sort((left, right) => {
    let result = 0;

    switch (field) {
      case 'applicant':
        result = compareStrings(
          getApplicantSortValue(left),
          getApplicantSortValue(right),
        );
        break;
      case 'post':
        result = compareStrings(getPostSortValue(left), getPostSortValue(right));
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

export const getApplicationStatusColor = (status: Application['status']) => {
  if (status === 'ACCEPTED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'WITHDRAWN') return 'default';
  if (status === 'VIEWED') return 'info';
  return 'primary';
};
