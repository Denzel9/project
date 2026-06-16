import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'

import type {
  CreateTaskCommentDto,
  Task,
  TaskComment,
  TaskCommentList,
  TaskCommentListParams,
  TaskList,
  TaskListParams,
  UpdateTaskCommentDto,
  UpdateTaskDto,
  UploadMediaResponse,
} from './types'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (params?: TaskListParams) =>
    [...taskKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  comments: (taskId: string, params?: TaskCommentListParams) =>
    [...taskKeys.all, 'comments', taskId, params ?? {}] as const,
}

export const useTasksQuery = (params?: TaskListParams) =>
  useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskList>('/tasks', { params })
      return data
    },
  })

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

export const uploadPostMedia = async (taskId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await mainAxios.post<UploadMediaResponse>(
    '/media/upload',
    formData,
    {
      params: { taskId },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )

  return data
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
      queryClient.setQueryData<Task | undefined>(
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
