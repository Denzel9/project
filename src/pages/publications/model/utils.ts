import { PLATFORM_LABELS, getPlatformLabel, type Platform } from '@/entities/post'
import { getUserName, type User } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { isGalleryMedia } from '@/widgets'

import type { PublicationSortField, PublicationSortOrder } from './types'
import type { Publication, PublicationListParams } from '@/entities/publication'

export type PublicationPostFilter = 'all' | string
export type PublicationExecutorFilter = 'all' | string
export type PublicationPlatformFilter = 'all' | Platform
export type PublicationTitleFilter = 'all' | string

type PublicationsFilterState = {
  q: string
  postId?: PublicationPostFilter
  executorId?: PublicationExecutorFilter
  platform?: PublicationPlatformFilter
  taskId?: string
  createdDate?: string | null
}

const isValidFilterId = (value?: string | null): value is string =>
  Boolean(value) && value !== 'all' && value !== 'undefined' && value !== 'null'

export const PUBLICATION_PLATFORM_FILTER_OPTIONS: {
  id: Platform
  label: string
}[] = (
  Object.entries(PLATFORM_LABELS) as [Platform, string][]
).map(([id, label]) => ({ id, label }))

export const toPublicationsParams = ({
  q,
  postId,
  taskId,
  executorId,
  platform,
  createdDate,
}: PublicationsFilterState): Omit<PublicationListParams, 'page'> => ({
  ...(q.trim() && { q: q.trim() }),
  ...(isValidFilterId(postId) && postId !== 'all' && { postId }),
  ...(isValidFilterId(taskId) && { taskId }),
  ...(isValidFilterId(executorId) &&
    executorId !== 'all' && { executorId }),
  ...(platform && platform !== 'all' && { platform }),
  ...(createdDate && { createdDate }),
})

export const hasActivePublicationFilters = ({
  q,
  postId = 'all',
  executorId = 'all',
  platform = 'all',
  createdDate = null,
}: Pick<
  PublicationsFilterState,
  'q' | 'postId' | 'executorId' | 'platform' | 'createdDate'
>) =>
  Boolean(q.trim()) ||
  (isValidFilterId(postId) && postId !== 'all') ||
  (isValidFilterId(executorId) && executorId !== 'all') ||
  (platform !== 'all' && Boolean(platform)) ||
  Boolean(createdDate)

export const parsePublicationSearchParams = (
  searchParams: URLSearchParams,
): Pick<PublicationsFilterState, 'postId' | 'taskId' | 'executorId'> => {
  const postId = searchParams.get('postId')
  const executorId = searchParams.get('executorId')
  const taskId = searchParams.get('taskId')

  return {
    ...(isValidFilterId(postId) && { postId }),
    ...(isValidFilterId(executorId) && { executorId }),
    ...(isValidFilterId(taskId) && { taskId }),
  }
}

export const getPublicationPostOptions = (publications: Publication[]) => {
  const map = new Map<string, string>()

  publications.forEach(publication => {
    if (map.has(publication.postId)) return

    map.set(
      publication.postId,
      publication.post?.title?.trim() ||
      publication.title?.trim() ||
      `Объявление ${publication.postId.slice(0, 8)}`,
    )
  })

  return Array.from(map.entries()).sort((left, right) =>
    left[1].localeCompare(right[1], 'ru'),
  )
}

export const getPublicationTitle = (publication: Publication) =>
  publication.title?.trim() || 'Публикация'

export const getPublicationPostTitle = (publication: Publication) =>
  publication.post?.title?.trim() ||
  `Объявление ${publication.postId.slice(0, 8)}`

export const getPublicationPostPath = (publication: Publication) =>
  `${ROUTES.POST}/${publication.postId}`

export const getPublicationPlatforms = (publication: Publication) => [
  ...new Set(
    [
      publication.platform,
      ...(publication.deliverables ?? []).map(item => item.platform),
    ].filter((platform): platform is NonNullable<typeof platform> =>
      Boolean(platform),
    ),
  ),
]

export type PublicationLinkItem = {
  id: string
  title: string
  url: string
  platformLabel: string
}

export const getPublicationLinkItems = (
  publications: Publication[],
): PublicationLinkItem[] =>
  publications.flatMap(publication => {
    const url = publication.externalUrl?.trim()
    if (!url) return []

    const platforms = getPublicationPlatforms(publication)

    return [
      {
        id: publication.id,
        title: getPublicationTitle(publication),
        url,
        platformLabel: platforms.length
          ? platforms.map(getPlatformLabel).join(', ')
          : 'Площадка не указана',
      },
    ]
  })

export const getPublicationGalleryMediaItems = (publication: Publication) =>
  publication.media
    .filter(item => isGalleryMedia(item.mimeType, item.url))
    .map(({ url, mimeType }) => ({ url, mimeType }))

export const getPublicationPreviewMedia = (publication: Publication) =>
  publication.media.filter(item => isGalleryMedia(item.mimeType, item.url))

export const getPublicationTaskPath = (publication: Publication) =>
  `${ROUTES.TASK}/${publication.postId}?taskId=${publication.taskId}&inviteId=${publication.taskId}`

export const getPublicationExecutorName = (publication: Publication) => {
  if (publication.executor) {
    return (
      `${publication.executor.name ?? ''} ${publication.executor.lastName ?? ''}`.trim() ||
      getUserName(publication.owner as Partial<User>)
    )
  }

  return getUserName(publication.owner as Partial<User>)
}

export const sortPublications = (
  publications: Publication[],
  sortField: PublicationSortField,
  sortOrder: PublicationSortOrder,
) => {
  const direction = sortOrder === 'asc' ? 1 : -1

  return [...publications].sort((left, right) => {
    switch (sortField) {
      case 'title':
        return (
          getPublicationTitle(left).localeCompare(getPublicationTitle(right), 'ru') *
          direction
        )
      case 'post':
        return (
          getPublicationPostTitle(left).localeCompare(
            getPublicationPostTitle(right),
            'ru',
          ) * direction
        )
      case 'platform': {
        const leftPlatform = getPublicationPlatforms(left)
          .map(getPlatformLabel)
          .join(', ')
        const rightPlatform = getPublicationPlatforms(right)
          .map(getPlatformLabel)
          .join(', ')

        return leftPlatform.localeCompare(rightPlatform, 'ru') * direction
      }
      case 'executor':
        return (
          (getPublicationExecutorName(left)?.localeCompare(
            getPublicationExecutorName(right) || '',
            'ru',
          ) || 0) * direction
        )
      case 'createdAt':
        return (
          (new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime()) *
          direction
        )
      default:
        return 0
    }
  })
}

export const getPublicationExecutorOptions = (publications: Publication[]) => {
  const map = new Map<string, string>()

  publications.forEach(publication => {
    const executor = publication.executor

    if (!executor?.id || map.has(executor.id)) return

    const name =
      `${executor.name ?? ''} ${executor.lastName ?? ''}`.trim() ||
      'Исполнитель'

    map.set(executor.id, name)
  })

  return Array.from(map.entries()).sort((left, right) =>
    left[1].localeCompare(right[1], 'ru'),
  )
}

export const getPublicationTitleOptions = (publications: Publication[]) => {
  const map = new Map<string, string>()

  publications.forEach(publication => {
    const title = getPublicationTitle(publication)

    if (!title || map.has(title)) return

    map.set(title, title)
  })

  return Array.from(map.entries()).sort((left, right) =>
    left[1].localeCompare(right[1], 'ru'),
  )
}
