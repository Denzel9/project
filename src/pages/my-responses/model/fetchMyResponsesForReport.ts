import {
  fetchAllMyApplications,
  type Application,
} from '@/entities/application'

import {
  filterApplicationsByCompany,
  toMyApplicationsParams,
  type ApplicationStatusFilter,
  type CompanyFilter,
} from './utils'

export type MyResponsesReportOptions = {
  status: ApplicationStatusFilter
  updatedDate: string | null
  companyId: CompanyFilter
}

export const fetchMyResponsesForReport = async (
  options: MyResponsesReportOptions,
) => {
  const params = toMyApplicationsParams({
    status: options.status,
    updatedDate: options.updatedDate,
  })

  const { page: _page, limit: _limit, ...filters } = params

  const items = await fetchAllMyApplications(filters)

  return filterApplicationsByCompany(items, options.companyId)
}

export type { Application }
