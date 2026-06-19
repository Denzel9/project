
import type { ApplicationListParams, ApplicationStatus } from '@/entities';

export type ApplicationStatusFilter = ApplicationStatus | 'all';

export const toMyApplicationsParams = (
  filters: {
    status: ApplicationStatusFilter;
    updatedDate: string | null;
  },
  pagination?: { page?: number; limit?: number },
): ApplicationListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
});
