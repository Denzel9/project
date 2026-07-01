import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { taskKeys } from '@/entities/task'
import { getUserName, type User } from '@/entities/user'
import { mainAxios } from '@/shared/api'
import { fetchAllPages } from '@/shared/lib/pagination/fetchAllPages'

import type {
  Application,
  ApplicationList,
  ApplicationListParams,
  CreateApplicationDto,
  SearchApplicationsParams,
  UpdateApplicationStatusDto,
} from './types'

export const applicationKeys = {
  all: ['applications'] as const,
  mine: (params?: ApplicationListParams) =>
    [...applicationKeys.all, 'mine', params ?? {}] as const,
  incoming: (params?: ApplicationListParams) =>
    [...applicationKeys.all, 'incoming', params ?? {}] as const,
  byPost: (postId: string, params?: ApplicationListParams) =>
    [...applicationKeys.all, 'post', postId, params ?? {}] as const,
  search: (params: SearchApplicationsParams) =>
    [...applicationKeys.all, 'search', params] as const,
  forPosts: (postIds: string[]) =>
    [...applicationKeys.all, 'forPosts', postIds] as const,
  allMineMap: () => [...applicationKeys.all, 'allMineMap'] as const,
  infiniteMine: (params?: Omit<ApplicationListParams, 'page'>) =>
    [...applicationKeys.all, 'infiniteMine', params ?? {}] as const,
  companyOptions: () => [...applicationKeys.all, 'companyOptions'] as const,
}

const getApplicationListNextPageParam = (lastPage: ApplicationList) =>
  lastPage.page * lastPage.limit < lastPage.total
    ? lastPage.page + 1
    : undefined

export const useMyApplicationsQuery = (params?: ApplicationListParams) =>
  useQuery({
    queryKey: applicationKeys.mine(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<ApplicationList>(
        '/applications/mine',
        { params },
      )
      return data
    },
  })

export const useMyApplicationsInfiniteQuery = (
  params?: Omit<ApplicationListParams, 'page'>,
) => {
  const limit = params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: applicationKeys.infiniteMine(params),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<ApplicationList>(
        '/applications/mine',
        { params: { ...params, page: pageParam, limit } },
      )
      return data
    },
    initialPageParam: 1,
    getNextPageParam: getApplicationListNextPageParam,
  })
}

export const useMyApplicationsCompanyOptionsQuery = () =>
  useQuery({
    queryKey: applicationKeys.companyOptions(),
    queryFn: async () => {
      const items = await fetchAllPages(async (page, limit) => {
        const { data } = await mainAxios.get<ApplicationList>(
          '/applications/mine',
          { params: { page, limit } },
        )

        return data
      })

      const map = new Map<string, string>()

      items.forEach(application => {
        const ownerId =
          application.post?.ownerId ?? application.post?.owner?.id
        const companyName = getUserName(
          application.post?.owner as Partial<User> | undefined,
        )?.trim()

        if (ownerId && companyName) {
          map.set(ownerId, companyName)
        }
      })

      return Array.from(map.entries())
        .map(([ownerId, companyName]) => ({ ownerId, companyName }))
        .sort((a, b) => a.companyName.localeCompare(b.companyName, 'ru'))
    },
    staleTime: 5 * 60 * 1000,
  })

export const useSearchMyApplicationsQuery = (params: SearchApplicationsParams) => {
  const trimmedQuery = params.q.trim()
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  return useQuery({
    queryKey: applicationKeys.search({ ...params, q: trimmedQuery, page, limit }),
    queryFn: async () => {
      const { data } = await mainAxios.get<ApplicationList>(
        '/applications/mine',
        { params: { q: trimmedQuery, page, limit } },
      )
      return data
    },
    enabled: trimmedQuery.length >= 2,
  })
}

export const useSearchIncomingApplicationsQuery = (
  params: SearchApplicationsParams,
) => {
  const trimmedQuery = params.q.trim()
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  return useQuery({
    queryKey: [
      ...applicationKeys.all,
      'incoming',
      'search',
      { ...params, q: trimmedQuery, page, limit },
    ] as const,
    queryFn: async () => {
      const { data } = await mainAxios.get<ApplicationList>(
        '/applications/incoming',
        { params: { q: trimmedQuery, page, limit } },
      )
      return data
    },
    enabled: trimmedQuery.length >= 2,
  })
}

export const useIncomingApplicationsQuery = (params?: ApplicationListParams) =>
  useQuery({
    queryKey: applicationKeys.incoming(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<ApplicationList>(
        '/applications/incoming',
        { params },
      )
      return data
    },
  })

export const usePostApplicationsQuery = (
  postId: string | null,
  params?: ApplicationListParams,
  isMinePost = false,
) =>
  useQuery({
    queryKey: applicationKeys.byPost(postId ?? '', params),
    queryFn: async () => {
      const { data } = await mainAxios.get<ApplicationList>(
        `/posts/${postId}/applications`,
        { params },
      )
      return data
    },
    enabled: Boolean(postId) && isMinePost,
  })

export const useMyApplicationsMap = () => {
  const { data } = useMyApplicationsQuery({ page: 1, limit: 100 })

  return useMemo(() => {
    const map = new Map<string, Application>()

    data?.items?.forEach(application => {
      map.set(application.post?.id ?? '', application)
    })

    return { map }
  }, [data])
}

export const useMyApplicationsMapForPosts = (postIds: string[]) => {
  const queryClient = useQueryClient()

  const { data: allApplicationsMap, isLoading, isFetching } = useQuery({
    queryKey: applicationKeys.allMineMap(),
    queryFn: async () => {
      const items = await fetchAllPages(async (page, limit) => {
        const { data } = await mainAxios.get<ApplicationList>(
          '/applications/mine',
          { params: { page, limit } },
        )

        return data
      })

      const map = new Map<string, Application>()

      items.forEach(application => {
        const postId = application.post?.id

        if (postId) {
          map.set(postId, application)
        }
      })

      return map
    },
    staleTime: 5 * 60 * 1000,
  })

  const map = useMemo(() => {
    const result = new Map<string, Application>()

    if (!allApplicationsMap) return result

    postIds.forEach(postId => {
      const application = allApplicationsMap.get(postId)

      if (application) {
        result.set(postId, application)
      }
    })

    return result
  }, [allApplicationsMap, postIds])

  const removePostFromCollection = useCallback(
    (postId: string) => {
      queryClient.setQueryData<Map<string, Application>>(
        applicationKeys.allMineMap(),
        previousMap => {
          if (!previousMap) return previousMap

          const nextMap = new Map(previousMap)
          nextMap.delete(postId)

          return nextMap
        },
      )
    },
    [queryClient],
  )

  return {
    map,
    isLoading,
    isFetching,
    removePostFromCollection,
  }
}

export const useCreateApplicationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateApplicationDto) => {
      const { data } = await mainAxios.post<Application>('/applications', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })
}

export const useWithdrawApplicationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mainAxios.patch<Application>(
        `/applications/${id}/withdraw`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })
}

export const useUpdateApplicationStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: UpdateApplicationStatusDto
    }) => {
      const { data } = await mainAxios.patch<Application>(
        `/applications/${id}/status`,
        body,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
