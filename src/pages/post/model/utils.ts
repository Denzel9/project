import {
  APPLICATION_STATUS_LABELS,
  getApplicantName,
} from '@/entities/application'

import type {
  Application,
  ApplicationListParams,
  ApplicationStatus,
} from '@/entities'

export type PostApplicationStatusFilter = ApplicationStatus | 'all'
export type PostApplicationApplicantFilter = 'all' | string

export const POST_APPLICATION_STATUS_FILTER_LABELS: Record<
  Exclude<PostApplicationStatusFilter, 'all'>,
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
  ...(status !== 'all' && { status }),
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
  status !== 'all' ||
  applicantId !== 'all' ||
  Boolean(createdDate)
