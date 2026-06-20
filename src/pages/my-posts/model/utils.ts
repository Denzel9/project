
import type { ApplicationListParams, ApplicationStatus } from '@/entities';

export type ApplicationStatusFilter = ApplicationStatus | 'all';

export type ApplicationPostTypeFilter = 'CREATOR' | 'COMPANY' | 'all';

export const toIncomingApplicationsParams = (
  filters: {
    status: ApplicationStatusFilter;
    updatedDate: string | null;
    q?: string;
    postId?: string;
    type?: ApplicationPostTypeFilter;
  },
  pagination?: { page?: number; limit?: number },
): ApplicationListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
  ...(filters.q?.trim() && { q: filters.q.trim() }),
  ...(filters.postId && filters.postId !== 'all' && { postId: filters.postId }),
  ...(filters.type && filters.type !== 'all' && { type: filters.type }),
});
