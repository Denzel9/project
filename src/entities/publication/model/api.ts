import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'
import { fetchAllPages } from '@/shared/lib/pagination/fetchAllPages'

import type { PublicationList, PublicationListParams } from './types'

export const publicationKeys = {
  all: ['publications'] as const,
  list: (params?: PublicationListParams) =>
    [...publicationKeys.all, 'list', params ?? {}] as const,
  infinite: (params?: Omit<PublicationListParams, 'page'>) =>
    [...publicationKeys.all, 'infinite', params ?? {}] as const,
}

const serializePublicationListParams = (
  params: PublicationListParams,
): Record<string, string | number> => {
  const serialized: Record<string, string | number> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue

    serialized[key] = value as string | number
  }

  if (params.createdDate !== undefined && params.tzOffset === undefined) {
    serialized.tzOffset = new Date().getTimezoneOffset()
  }

  return serialized
}

export const fetchPublicationsList = async (params?: PublicationListParams) => {
  const { data } = await mainAxios.get<PublicationList>('/publications', {
    params: params ? serializePublicationListParams(params) : undefined,
  })

  return data
}

const getPublicationListNextPageParam = (lastPage: PublicationList) =>
  lastPage.page * lastPage.limit < lastPage.total
    ? lastPage.page + 1
    : undefined

export const usePublicationsInfiniteQuery = (
  params?: Omit<PublicationListParams, 'page'>,
  options?: { enabled?: boolean; limit?: number },
) => {
  const limit = options?.limit ?? params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: publicationKeys.infinite({ ...params, limit }),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<PublicationList>('/publications', {
        params: serializePublicationListParams({
          ...params,
          page: pageParam,
          limit,
        }),
      })

      return data
    },
    initialPageParam: 1,
    getNextPageParam: getPublicationListNextPageParam,
    enabled: options?.enabled ?? true,
  })
}

export const usePublicationsQuery = (
  params?: PublicationListParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: publicationKeys.list(params),
    queryFn: () => fetchPublicationsList(params),
    refetchOnWindowFocus: true,
    enabled: options?.enabled ?? true,
  })

export const fetchAllPublications = async (
  params?: Omit<PublicationListParams, 'page' | 'limit'>,
) =>
  fetchAllPages(async (page, limit) =>
    fetchPublicationsList({ ...params, page, limit }),
  )
