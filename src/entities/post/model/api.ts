import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { taskKeys } from '@/entities/task'
import { mainAxios } from '@/shared/api'
import { prepareFileForUpload } from '@/shared/lib/media'

import type {
  CreatePostDto,
  CreatePostTaskDto,
  Post,
  PostListParams,
  PostTasksParams,
  SearchPostsParams,
  UpdatePostDto,
  UploadMediaResponse,
  PostList,
} from './types'
import type { Task, TaskList } from '@/entities/task'

export const postKeys = {
  all: ['posts'] as const,
  list: (params?: PostListParams) => [...postKeys.all, 'list', params ?? {}] as const,
  infiniteList: (params?: Omit<PostListParams, 'page'>) =>
    [...postKeys.all, 'infiniteList', params ?? {}] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
  search: (q: string, page: number, limit: number) =>
    [...postKeys.all, 'search', q, page, limit] as const,
  infiniteSearch: (params: Omit<SearchPostsParams, 'page'>) =>
    [...postKeys.all, 'infiniteSearch', params] as const,
  postTasks: (postId: string, params?: Omit<PostTasksParams, 'postId'>) =>
    [...postKeys.all, 'postTasks', postId, params ?? {}] as const,
}

const getPostListNextPageParam = (lastPage: PostList) =>
  lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined

export const usePostsQuery = (params?: PostListParams) =>
  useQuery({
    queryKey: postKeys.list(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<PostList>('/posts', { params })
      return data
    },
  })

export const usePostsInfiniteQuery = (
  params?: Omit<PostListParams, 'page'>,
) => {
  const limit = params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: postKeys.infiniteList(params),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<PostList>('/posts', {
        params: { ...params, page: pageParam, limit },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: getPostListNextPageParam,
  })
}

export const useSearchPostsQuery = (params: SearchPostsParams) => {
  const trimmedQuery = params.q.trim()
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  return useQuery({
    queryKey: postKeys.search(trimmedQuery, page, limit),
    queryFn: async () => {
      const { data } = await mainAxios.get<PostList>('/posts', {
        params: { q: trimmedQuery, page, limit },
      })
      return data
    },
    enabled: trimmedQuery.length >= 2,
  })
}

export const useSearchPostsInfiniteQuery = (
  params: Omit<SearchPostsParams, 'page'>,
) => {
  const trimmedQuery = params.q.trim()
  const limit = params.limit ?? 20

  return useInfiniteQuery({
    queryKey: postKeys.infiniteSearch({ ...params, q: trimmedQuery, limit }),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<PostList>('/posts', {
        params: { q: trimmedQuery, page: pageParam, limit },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: getPostListNextPageParam,
    enabled: trimmedQuery.length >= 2,
  })
}

export const usePostByIdQuery = (id: string | null) =>
  useQuery({
    queryKey: postKeys.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await mainAxios.get<Post>(`/posts/${id}`)
      return data
    },
    enabled: Boolean(id),
  })

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreatePostDto) => {
      const { data } = await mainAxios.post<Post>('/posts', body)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export const useUpdatePostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdatePostDto }) => {
      const { data } = await mainAxios.patch<Post>(`/posts/${id}`, body)
      return data
    },
    onSuccess: post => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      queryClient.setQueryData(postKeys.detail(post.id), post)
    },
  })
}

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await mainAxios.delete(`/posts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export const uploadPostMedia = async (postId: string, file: File) => {
  const prepared = await prepareFileForUpload(file)
  const formData = new FormData()
  formData.append('file', prepared)

  const { data } = await mainAxios.post<UploadMediaResponse>(
    '/media/upload',
    formData,
    {
      params: { postId },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )

  return data
}

export const uploadPostMediaBatch = async (postId: string, files: File[]) => {
  return Promise.all(files.map(file => uploadPostMedia(postId, file)))
}

export const useUploadPostMediaMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, files }: { postId: string; files: File[] }) =>
      uploadPostMediaBatch(postId, files),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export const usePostTasksQuery = (
  postId: string | null,
  params?: Omit<PostTasksParams, 'postId'>,
  skip?: boolean,
) =>
  useQuery({
    queryKey: postKeys.postTasks(postId ?? '', params),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskList>('/tasks', {
        params: { ...params, postId },
      })
      return data
    },
    enabled: Boolean(postId) && !skip,
  })

export const useCreatePostTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreatePostTaskDto) => {
      const { data } = await mainAxios.post<Task>('/tasks', body)
      return data
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.postTasks(postId) })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export const useDeletePostTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
    }: {
      taskId: string
      postId: string
    }) => {
      await mainAxios.delete(`/tasks/${taskId}`)
    },
    onSuccess: (_, { postId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.postTasks(postId) })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) })
    },
  })
}


