import { fetchAllPublications, type Publication } from '@/entities/publication'

import {
  filterPublicationsByExecutor,
  toPublicationsParams,
  type PublicationExecutorFilter,
  type PublicationPostFilter,
} from './utils'

type FetchPublicationsForReportOptions = {
  q: string
  postId: PublicationPostFilter
  executorId: PublicationExecutorFilter
  taskId?: string
}

export const fetchPublicationsForReport = async (
  options: FetchPublicationsForReportOptions,
): Promise<Publication[]> => {
  const params = toPublicationsParams(options)
  const items = await fetchAllPublications(params)

  return filterPublicationsByExecutor(items, options.executorId)
}
