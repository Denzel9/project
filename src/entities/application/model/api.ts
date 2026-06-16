import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

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
    enabled: Boolean(postId),
  })

export const useMyApplicationsMap = () => {
  const { data } = useMyApplicationsQuery({ page: 1, limit: 100 })

  return useMemo(() => {
    const map = new Map<string, Application>()

    data?.items?.forEach(application => {
      map.set(application.postId, application)
    })

    return { map }
  }, [data])
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
