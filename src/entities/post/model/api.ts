import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'

import type {
  CreatePostDto,
  Post,
  PostListParams,
  UpdatePostDto,
  UploadMediaResponse,
  PostList,
} from './types'

export const postKeys = {
  all: ['posts'] as const,
  list: (params?: PostListParams) => [...postKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
}

export const usePostsQuery = (params?: PostListParams) =>
  useQuery({
    queryKey: postKeys.list(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<PostList>('/posts', { params })
      return data
    },
  })

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
  const formData = new FormData()
  formData.append('file', file)

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
