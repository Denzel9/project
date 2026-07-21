import { getPlatformLabel } from '@/entities/post'
import { getUserName, type User } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { isGalleryMedia } from '@/widgets'

import type { PublicationSortField, PublicationSortOrder } from './types'
import type { Publication, PublicationListParams } from '@/entities/publication'

export type PublicationPostFilter = 'all' | string
export type PublicationExecutorFilter = 'all' | string

type PublicationsFilterState = {
  q: string
  postId?: PublicationPostFilter
  executorId?: PublicationExecutorFilter
  taskId?: string
}

export const toPublicationsParams = ({
  q,
  postId,
  taskId,
}: PublicationsFilterState): Omit<PublicationListParams, 'page'> => ({
  ...(q.trim() && { q: q.trim() }),
  ...(postId && postId !== 'all' && { postId }),
  ...(taskId && { taskId }),
})

export const hasActivePublicationFilters = ({
  q,
  postId = 'all',
  executorId = 'all',
}: Pick<
  PublicationsFilterState,
  'q' | 'postId' | 'executorId'
>) =>
  Boolean(q.trim()) || postId !== 'all' || executorId !== 'all'

export const parsePublicationSearchParams = (
  searchParams: URLSearchParams,
): Pick<PublicationsFilterState, 'postId' | 'taskId'> => {
  const postId = searchParams.get('postId')

  return {
    ...(postId && { postId }),
    taskId: searchParams.get('taskId') ?? undefined,
  }
}

export const filterPublicationsByExecutor = (
  publications: Publication[],
  executorId: PublicationExecutorFilter,
) => {
  if (executorId === 'all') return publications

  return publications.filter(
    publication => publication.executor?.id === executorId,
  )
}

export const getPublicationPostOptions = (publications: Publication[]) => {
  const map = new Map<string, string>()

  publications.forEach(publication => {
    if (map.has(publication.postId)) return

    map.set(
      publication.postId,
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
      case 'platform': {
        const leftPlatform = left.platform
          ? getPlatformLabel(left.platform)
          : ''
        const rightPlatform = right.platform
          ? getPlatformLabel(right.platform)
          : ''

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
