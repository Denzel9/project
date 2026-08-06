import {
  fetchAllPublications,
  type Publication,
} from '@/entities/publication'

import {
  toPublicationsParams,
  type PublicationExecutorFilter,
  type PublicationPlatformFilter,
  type PublicationPostFilter,
} from './utils'

type FetchPublicationsForReportOptions = {
  q: string
  postId: PublicationPostFilter
  executorId: PublicationExecutorFilter
  platform?: PublicationPlatformFilter
  taskId?: string
}

export const fetchPublicationsForReport = async (
  options: FetchPublicationsForReportOptions,
): Promise<Publication[]> => {
  const params = toPublicationsParams(options)

  return fetchAllPublications(params)
}
