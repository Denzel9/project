import type { ApplicationList, ApplicationListParams } from '@/entities'

export type PostApplicationStatusFilter =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'rejected'

export const POST_APPLICATION_STATUS_FILTER_LABELS: Record<
  PostApplicationStatusFilter,
  string
> = {
  all: 'Все',
  pending: 'Ожидание',
  accepted: 'Принято',
  rejected: 'Отклонено',
}

export const toPostApplicationsQueryParams = (
  filter: PostApplicationStatusFilter,
): ApplicationListParams => ({
  page: 1,
  limit: 20,
  ...(filter === 'accepted' && { status: 'ACCEPTED' }),
  ...(filter === 'rejected' && { status: 'REJECTED' }),
})

export const filterPostApplicationsByStatus = (
  applications: ApplicationList | undefined,
  filter: PostApplicationStatusFilter,
): ApplicationList | undefined => {
  if (!applications || filter !== 'pending') return applications

  const items = applications.items.filter(
    item => (item.status === 'NEW' || item.status === 'VIEWED'),
  )

  return {
    ...applications,
    items,
    total: items.length,
  }
}
