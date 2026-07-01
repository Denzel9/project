
import type { Application, ApplicationListParams, ApplicationStatus } from '@/entities';

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
  },
  pagination?: { page?: number; limit?: number },
): ApplicationListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
});

export const hasActiveMyResponseFilters = (filters: {
  status: ApplicationStatusFilter;
  updatedDate: string | null;
  companyId: CompanyFilter;
}) =>
  filters.status !== 'all' ||
  Boolean(filters.updatedDate) ||
  filters.companyId !== 'all';

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
