import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'
import { prepareFileForUpload } from '@/shared/lib/media'

import { toTaskCommentMedia } from './utils'

import type {
  CreateTaskCommentDto,
  Task,
  TaskActivityList,
  TaskActivityListParams,
  TaskComment,
  TaskCommentAttachmentList,
  TaskCommentAttachmentsParams,
  TaskCommentList,
  TaskCommentListParams,
  TaskCommentMedia,
  SearchTaskCommentsParams,
  TaskList,
  TaskListParams,
  TaskMediaUploadKind,
  SearchTasksParams,
  UpdateTaskCommentDto,
  UpdateTaskDto,
} from './types'
import type { UploadMediaResponse } from '@/entities/post'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (params?: TaskListParams) =>
    [...taskKeys.all, 'list', params ?? {}] as const,
  search: (params: SearchTasksParams) =>
    [...taskKeys.all, 'search', params] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  comments: (taskId: string, params?: TaskCommentListParams) =>
    [...taskKeys.all, 'comments', taskId, params ?? {}] as const,
  searchComments: (taskId: string, params: SearchTaskCommentsParams) =>
    [...taskKeys.all, 'comments', taskId, 'search', params] as const,
  commentAttachments: (
    taskId: string,
    params?: TaskCommentAttachmentsParams,
  ) => [...taskKeys.all, 'comments', taskId, 'attachments', params ?? {}] as const,
  activities: (taskId: string, params?: TaskActivityListParams) =>
    [...taskKeys.all, 'activities', taskId, params ?? {}] as const,
}

export const useTasksQuery = (params?: TaskListParams) =>
  useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskList>('/tasks', { params })
      return data
    },
    refetchOnWindowFocus: true,
  })

export const useSearchTasksQuery = (params: SearchTasksParams) => {
  const trimmedQuery = params.q.trim()
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  return useQuery({
    queryKey: taskKeys.search({ ...params, q: trimmedQuery, page, limit }),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskList>('/tasks', {
        params: { q: trimmedQuery, page, limit },
      })
      return data
    },
    enabled: trimmedQuery.length >= 2,
  })
}

export const useTaskByIdQuery = (id: string | null) =>
  useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await mainAxios.get<Task>(`/tasks/${id}`)
      return data
    },
    enabled: Boolean(id),
  })

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateTaskDto }) => {
      const { data } = await mainAxios.patch<Task>(`/tasks/${id}`, body)
      return data
    },
    onSuccess: task => {
      queryClient.setQueryData(taskKeys.detail(task.id), task)
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'activities', task.id],
      })
    },
  })
}

export const useTaskCommentsQuery = (
  taskId: string | null,
  params?: TaskCommentListParams,
) =>
  useQuery({
    queryKey: taskKeys.comments(taskId ?? '', params),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskCommentList>(
        `/tasks/${taskId}/comments`,
        { params },
      )
      return data
    },
    enabled: Boolean(taskId),
  })

export const useSearchTaskCommentsQuery = (
  taskId: string | null,
  params: SearchTaskCommentsParams,
) => {
  const trimmedQuery = params.q.trim()
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  return useQuery({
    queryKey: taskKeys.searchComments(taskId ?? '', {
      ...params,
      q: trimmedQuery,
      page,
      limit,
    }),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskCommentList>(
        `/tasks/${taskId}/comments/search`,
        { params: { q: trimmedQuery, page, limit } },
      )
      return data
    },
    enabled: Boolean(taskId && trimmedQuery.length >= 2),
  })
}

export const useTaskCommentAttachmentsQuery = (
  taskId: string | null,
  params?: TaskCommentAttachmentsParams,
) => {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const type = params?.type

  return useQuery({
    queryKey: taskKeys.commentAttachments(taskId ?? '', {
      type,
      page,
      limit,
    }),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskCommentAttachmentList>(
        `/tasks/${taskId}/comments/attachments`,
        { params: { type, page, limit } },
      )
      return data
    },
    enabled: Boolean(taskId),
  })
}

export const useTaskActivitiesQuery = (
  taskId: string | null,
  params?: TaskActivityListParams,
) =>
  useQuery({
    queryKey: taskKeys.activities(taskId ?? '', params),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskActivityList>(
        `/tasks/${taskId}/activities`,
        { params },
      )
      return data
    },
    enabled: Boolean(taskId),
  })

export const useCreateTaskCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      body,
    }: {
      taskId: string
      body: CreateTaskCommentDto
    }) => {
      const { data } = await mainAxios.post<TaskComment>(
        `/tasks/${taskId}/comments`,
        body,
      )
      return data
    },
    onSuccess: (comment, { taskId }) => {
      queryClient.setQueryData<Task | undefined>(
        taskKeys.detail(taskId),
        old =>
          old
            ? {
              ...old,
              comments: [...(old.comments ?? []), comment],
            }
            : old,
      )
      queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) })
    },
  })
}

export const useUpdateTaskCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      commentId,
      body,
    }: {
      taskId: string
      commentId: string
      body: UpdateTaskCommentDto
    }) => {
      const { data } = await mainAxios.patch<TaskComment>(
        `/tasks/${taskId}/comments/${commentId}`,
        body,
      )
      return data
    },
    onSuccess: (comment, { taskId }) => {
      queryClient.setQueryData<Task | undefined>(
        taskKeys.detail(taskId),
        old =>
          old
            ? {
              ...old,
              comments: (old.comments ?? []).map(item =>
                item.id === comment.id ? comment : item,
              ),
            }
            : old,
      )
      queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) })
    },
  })
}

export const uploadTaskMedia = async (
  taskId: string,
  file: File,
  kind: TaskMediaUploadKind = 'main',
) => {
  const prepared = await prepareFileForUpload(file)
  const formData = new FormData()
  formData.append('file', prepared)

  const { data } = await mainAxios.post<UploadMediaResponse>(
    '/media/upload',
    formData,
    {
      params: {
        taskId,
        ...(kind === 'report' ? { kind: 'report' } : {}),
      },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )

  return data
}

export const uploadTaskMediaBatch = async (
  taskId: string,
  files: File[],
  kind: TaskMediaUploadKind = 'main',
) => Promise.all(files.map(file => uploadTaskMedia(taskId, file, kind)))

export const uploadTaskCommentMedia = async (taskId: string, file: File) => {
  const prepared = await prepareFileForUpload(file)
  const formData = new FormData()
  formData.append('file', prepared)

  const { data } = await mainAxios.post<UploadMediaResponse>(
    '/media/upload',
    formData,
    {
      params: { taskId, forComment: true },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )

  return data
}

export const uploadTaskCommentMediaBatch = async (
  taskId: string,
  files: File[],
): Promise<TaskCommentMedia[]> => {
  const uploads = await Promise.all(
    files.map(file => uploadTaskCommentMedia(taskId, file)),
  )

  return uploads.map(toTaskCommentMedia)
}

export const useUploadTaskMediaMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      files,
      kind = 'main',
    }: {
      taskId: string
      files: File[]
      kind?: TaskMediaUploadKind
    }) => uploadTaskMediaBatch(taskId, files, kind),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'activities', taskId],
      })
    },
  })
}

export const useDeleteTaskCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      commentId,
    }: {
      taskId: string
      commentId: string
    }) => {
      await mainAxios.delete(`/tasks/${taskId}/comments/${commentId}`)
      return commentId
    },
    onSuccess: (commentId, { taskId }) => {
      queryClient.setQueryData<Task>(
        taskKeys.detail(taskId),
        old =>
          old
            ? {
              ...old,
              comments: (old.comments ?? []).filter(
                item => item.id !== commentId,
              ),
            }
            : old,
      )
      queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) })
    },
  })
}
