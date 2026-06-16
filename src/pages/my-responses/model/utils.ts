import type { ApplicationListParams, ApplicationStatus } from '@/entities/application';
import { POST_TYPE_ENUM } from '@/entities/post';

export type ApplicationStatusFilter = ApplicationStatus | 'all';

export const toMyApplicationsParams = (
  filters: {
    status: ApplicationStatusFilter;
    postType: POST_TYPE_ENUM;
    updatedDate: string | null;
  },
  pagination?: { page?: number; limit?: number },
): ApplicationListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.postType !== POST_TYPE_ENUM.ALL && { type: filters.postType }),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
});
