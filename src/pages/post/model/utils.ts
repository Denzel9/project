import {
  APPLICATION_STATUS_LABELS,
  getApplicantName,
} from '@/entities/application'

import type {
  Application,
  ApplicationListParams,
  ApplicationStatus,
} from '@/entities'

export const POST_PAGE_TAB = {
  DESCRIPTION: 0,
  APPLICATIONS: 1,
  TASKS: 2,
} as const

export type PostPageTab = (typeof POST_PAGE_TAB)[keyof typeof POST_PAGE_TAB]

export type PostApplicationStatusFilter = ApplicationStatus[]
export type PostApplicationApplicantFilter = 'all' | string

export const POST_APPLICATION_STATUS_FILTER_LABELS: Record<
  ApplicationStatus,
  string
> = APPLICATION_STATUS_LABELS

export const toPostApplicationsQueryParams = ({
  status,
  applicantId,
  createdDate,
}: {
  status: PostApplicationStatusFilter
  applicantId: PostApplicationApplicantFilter
  createdDate: string | null
}): ApplicationListParams => ({
  page: 1,
  limit: 20,
  ...(status.length > 0 && { statuses: status }),
  ...(applicantId !== 'all' && { userId: applicantId }),
  ...(createdDate && { createdDate }),
})

export const getPostApplicationApplicantOptions = (
  applications: Application[],
) => {
  const map = new Map<string, string>()

  applications.forEach(application => {
    const id = application.applicant?.id
    if (!id || map.has(id)) return

    map.set(id, getApplicantName(application.applicant))
  })

  return Array.from(map.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((left, right) => left.label.localeCompare(right.label, 'ru'))
}

export const hasActivePostApplicationFilters = ({
  status,
  applicantId,
  createdDate,
}: {
  status: PostApplicationStatusFilter
  applicantId: PostApplicationApplicantFilter
  createdDate: string | null
}) =>
  status.length > 0 ||
  applicantId !== 'all' ||
  Boolean(createdDate)
