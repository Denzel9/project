import { fetchAllIncomingApplications } from '@/entities/application'

import { toIncomingApplicationsParams } from './utils'

import type {
  ApplicationPostTypeFilter,
  ApplicationStatusFilter,
} from './utils'

export type IncomingApplicationsReportOptions = {
  status: ApplicationStatusFilter
  updatedDate: string | null
  q?: string
  postId?: string
  userId?: string
  type?: ApplicationPostTypeFilter
}

export const fetchIncomingApplicationsForReport = (
  options: IncomingApplicationsReportOptions,
) => {
  const params = toIncomingApplicationsParams(options)

  const { page: _page, limit: _limit, ...filters } = params

  return fetchAllIncomingApplications(filters)
}
