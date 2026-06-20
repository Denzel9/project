import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { taskKeys } from '@/entities/task'
import { mainAxios } from '@/shared/api'

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
}

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

  const sortedPostIds = useMemo(
    () => [...postIds].sort(),
    [postIds],
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: applicationKeys.forPosts(sortedPostIds),
    queryFn: async () => {
      const limit = Math.min(Math.max(sortedPostIds.length, 20), 100)
      const { data } = await mainAxios.get<ApplicationList>(
        '/applications/mine',
        { params: { page: 1, limit } },
      )

      const map = new Map<string, Application>()

      data.items.forEach(application => {
        if (sortedPostIds.includes(application.post?.id ?? '')) {
          map.set(application.post?.id ?? '', application)
        }
      })

      return map
    },
    enabled: sortedPostIds.length > 0,
    placeholderData: previousData => previousData,
  })

  const removePostFromCollection = useCallback(
    (postId: string) => {
      queryClient.setQueryData<Map<string, Application>>(
        applicationKeys.forPosts(sortedPostIds),
        previousMap => {
          if (!previousMap) return previousMap

          const nextMap = new Map(previousMap)
          nextMap.delete(postId)
          return nextMap
        },
      )
    },
    [queryClient, sortedPostIds],
  )

  return {
    map: data ?? new Map<string, Application>(),
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
