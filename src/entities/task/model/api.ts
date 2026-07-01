import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'
import {
  mapInBatches,
  MEDIA_UPLOAD_CONCURRENCY,
  prepareFileForUpload,
} from '@/shared/lib/media'
import { fetchAllPages } from '@/shared/lib/pagination/fetchAllPages'

import { toTaskCommentMedia, normalizeTaskWithCommentsItem, getCommentsTailPage } from './utils'

import type {
  CreateTaskCommentDto,
  CreateTaskDto,
  Task,
  TaskActivityList,
  TaskActivityListParams,
  TaskActivityFeedList,
  TaskActivityFeedParams,
  TaskComment,
  TaskCommentAttachmentList,
  TaskCommentAttachmentsParams,
  TaskCommentList,
  TaskCommentListParams,
  TaskCommentFeedList,
  TaskCommentFeedParams,
  TaskWithCommentsParams,
  TaskWithCommentsRawItem,
  TaskCommentMedia,
  SearchTaskCommentsParams,
  TaskList,
  TaskListParams,
  TaskMediaUploadKind,
  SearchTasksParams,
  UpdateTaskCommentDto,
  UpdateTaskDto,
} from './types'
import type { TaskMedia } from './types'
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
  allActivities: (params?: Omit<TaskActivityFeedParams, 'page'>) =>
    [...taskKeys.all, 'allActivities', params ?? {}] as const,
  allComments: (params?: Omit<TaskCommentFeedParams, 'page'>) =>
    [...taskKeys.all, 'allComments', params ?? {}] as const,
  withComments: (params?: Omit<TaskWithCommentsParams, 'page'>) =>
    [...taskKeys.all, 'withComments', params ?? {}] as const,
  executorByPostMap: () => [...taskKeys.all, 'executorByPostMap'] as const,
  allTasks: (params?: Omit<TaskListParams, 'page' | 'limit'>) =>
    [...taskKeys.all, 'allTasks', params ?? {}] as const,
}

const postTasksQueryPrefix = (postId: string) =>
  ['posts', 'postTasks', postId] as const

const uploadsToTaskMedia = (
  uploads: UploadMediaResponse[],
  kind: TaskMediaUploadKind,
): TaskMedia[] =>
  uploads.map(upload => ({
    id: upload.key,
    url: upload.url,
    key: upload.key,
    mimeType: upload.mimeType,
    size: String(upload.size),
    ...(kind === 'report' ? { kind: 'REPORT' as const } : {}),
  }))

const getTaskMediaField = (kind: TaskMediaUploadKind) =>
  kind === 'report' ? 'reportMedia' as const : 'media' as const

const mergeUploadedMediaIntoTaskCache = (
  queryClient: QueryClient,
  taskId: string,
  uploads: UploadMediaResponse[],
  kind: TaskMediaUploadKind,
) => {
  if (!uploads.length) return

  const mediaField = getTaskMediaField(kind)
  const appendedMedia = uploadsToTaskMedia(uploads, kind)

  const patchTask = (task: Task): Task => {
    const currentMedia = task[mediaField] ?? []
    const existingKeys = new Set(currentMedia.map(item => item.key))
    const nextMedia = [
      ...currentMedia,
      ...appendedMedia.filter(item => !existingKeys.has(item.key)),
    ]

    return { ...task, [mediaField]: nextMedia }
  }

  queryClient.setQueryData<Task>(taskKeys.detail(taskId), old =>
    old ? patchTask(old) : old,
  )

  const cachedTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId))
  const postId = cachedTask?.postId

  if (!postId) return

  queryClient.setQueriesData<TaskList>(
    { queryKey: postTasksQueryPrefix(postId) },
    old => {
      if (!old?.items?.length) return old

      return {
        ...old,
        items: old.items.map(item =>
          item.id === taskId ? patchTask(item) : item,
        ),
      }
    },
  )
}

export const removeTaskMediaFromCache = (
  queryClient: QueryClient,
  taskId: string,
  mediaId: string,
) => {
  const patchTask = (task: Task): Task => ({
    ...task,
    media: task.media?.filter(item => item.id !== mediaId && item.key !== mediaId),
    reportMedia: task.reportMedia?.filter(
      item => item.id !== mediaId && item.key !== mediaId,
    ),
  })

  queryClient.setQueryData<Task>(taskKeys.detail(taskId), old =>
    old ? patchTask(old) : old,
  )

  const cachedTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId))
  const postId = cachedTask?.postId

  if (!postId) return

  queryClient.setQueriesData<TaskList>(
    { queryKey: postTasksQueryPrefix(postId) },
    old => {
      if (!old?.items?.length) return old

      return {
        ...old,
        items: old.items.map(item =>
          item.id === taskId ? patchTask(item) : item,
        ),
      }
    },
  )
}

const invalidateTaskRelatedQueries = (queryClient: QueryClient, task: Task) => {
  const cachedTask = queryClient.getQueryData<Task>(taskKeys.detail(task.id))
  const postId = task.postId || cachedTask?.postId
  const mergedTask = { ...cachedTask, ...task, postId: postId ?? task.postId }

  queryClient.setQueryData(taskKeys.detail(task.id), mergedTask)

  void queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) })

  void queryClient.invalidateQueries({
    queryKey: [...taskKeys.all, 'allActivities'],
  })

  if (postId) {
    void queryClient.invalidateQueries({
      queryKey: postTasksQueryPrefix(postId),
    })
  }

  void queryClient.invalidateQueries({ queryKey: ['user', task.executorId] })
  void queryClient.invalidateQueries({ queryKey: ['user', task.ownerId] })
  void queryClient.invalidateQueries({
    queryKey: ['executor', 'pending-approval-tasks'],
  })
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

export const useExecutorTasksByPostMap = () =>
  useQuery({
    queryKey: taskKeys.executorByPostMap(),
    queryFn: async () => {
      const items = await fetchAllPages(async (page, limit) => {
        const { data } = await mainAxios.get<TaskList>('/tasks', {
          params: { page, limit, role: 'executor' },
        })

        return data
      })

      const map = new Map<string, Task>()

      items.forEach(task => {
        if (task.postId) {
          map.set(task.postId, task)
        }
      })

      return map
    },
    staleTime: 5 * 60 * 1000,
  })

export const useAllTasksQuery = (
  params?: Omit<TaskListParams, 'page' | 'limit'>,
) =>
  useQuery({
    queryKey: taskKeys.allTasks(params),
    queryFn: async () => {
      const items = await fetchAllPages(async (page, limit) => {
        const { data } = await mainAxios.get<TaskList>('/tasks', {
          params: { ...params, page, limit },
        })

        return data
      })

      return items
    },
    staleTime: 5 * 60 * 1000,
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

export const useTaskByIdQuery = (id: string | null, skip?: boolean) =>
  useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await mainAxios.get<Task>(`/tasks/${id}`)
      return data
    },
    enabled: Boolean(id) && !skip,
  })

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateTaskDto }) => {
      const { data } = await mainAxios.patch<Task>(`/tasks/${id}`, body)
      return data
    },
    onSuccess: task => {
      invalidateTaskRelatedQueries(queryClient, task)
    },
  })
}

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateTaskDto) => {
      const { data } = await mainAxios.post<Task>('/tasks', body)
      return data
    },
    onSuccess: task => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.setQueryData(taskKeys.detail(task.id), task)
    },
  })
}

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await mainAxios.delete(`/tasks/${id}`)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) })
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

export const fetchTaskCommentsPage = async (
  taskId: string,
  page: number,
  limit: number,
) => {
  const { data } = await mainAxios.get<TaskCommentList>(
    `/tasks/${taskId}/comments`,
    { params: { page, limit } },
  )

  return data
}

export const useTaskCommentsTailQuery = (
  taskId: string | null,
  limit: number,
  enabled = true,
  lastCommentId?: string,
) =>
  useQuery({
    queryKey: [...taskKeys.comments(taskId ?? ''), 'tail', limit, lastCommentId] as const,
    queryFn: async () => {
      const { data: meta } = await mainAxios.get<TaskCommentList>(
        `/tasks/${taskId}/comments`,
        { params: { page: 1, limit: 1 } },
      )

      const page = getCommentsTailPage(Math.max(meta.total, 1), limit)

      const { data } = await mainAxios.get<TaskCommentList>(
        `/tasks/${taskId}/comments`,
        { params: { page, limit } },
      )

      const hasLastComment =
        !lastCommentId ||
        data.items.some(comment => comment.id === lastCommentId)

      if (hasLastComment || page === 1) {
        return data
      }

      const { data: newestPage } = await mainAxios.get<TaskCommentList>(
        `/tasks/${taskId}/comments`,
        { params: { page: 1, limit } },
      )

      return newestPage
    },
    enabled: enabled && Boolean(taskId),
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

export const useAllTaskActivitiesQuery = (
  params?: TaskActivityFeedParams,
) =>
  useQuery({
    queryKey: taskKeys.allActivities(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskActivityFeedList>(
        '/tasks/activities',
        { params },
      )
      return data
    },
  })

export const useAllTaskActivitiesInfiniteQuery = (
  params?: Omit<TaskActivityFeedParams, 'page'>,
) => {
  const limit = params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: taskKeys.allActivities(params),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<TaskActivityFeedList>(
        '/tasks/activities',
        {
          params: {
            ...params,
            page: pageParam,
            limit,
          },
        },
      )

      return data
    },
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page * lastPage.limit < lastPage.total
        ? lastPage.page + 1
        : undefined,
  })
}

export const useAllTaskCommentsInfiniteQuery = (
  params?: Omit<TaskCommentFeedParams, 'page'>,
) => {
  const limit = params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: taskKeys.allComments(params),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<TaskCommentFeedList>(
        '/tasks/comments',
        {
          params: {
            ...params,
            page: pageParam,
            limit,
          },
        },
      )

      return data
    },
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page * lastPage.limit < lastPage.total
        ? lastPage.page + 1
        : undefined,
  })
}

export const useTasksWithCommentsInfiniteQuery = (
  params?: Omit<TaskWithCommentsParams, 'page'>,
) => {
  const limit = params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: taskKeys.withComments(params),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<{
        items: TaskWithCommentsRawItem[]
        total: number
        page: number
        limit: number
      }>(
        '/tasks/with-comments',
        {
          params: {
            ...params,
            page: pageParam,
            limit,
          },
        },
      )

      return {
        ...data,
        items: data.items.map(normalizeTaskWithCommentsItem),
      }
    },
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page * lastPage.limit < lastPage.total
        ? lastPage.page + 1
        : undefined,
  })
}

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
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'allComments'],
      })
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'withComments'],
      })
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
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'allComments'],
      })
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'withComments'],
      })
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
) =>
  mapInBatches(
    files,
    file => uploadTaskMedia(taskId, file, kind),
    MEDIA_UPLOAD_CONCURRENCY,
  )

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
  const uploads = await mapInBatches(
    files,
    file => uploadTaskCommentMedia(taskId, file),
    MEDIA_UPLOAD_CONCURRENCY,
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
    onSuccess: (uploads, { taskId, kind }) => {
      mergeUploadedMediaIntoTaskCache(queryClient, taskId, uploads, kind ?? 'main')

      const cachedTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId))
      const postId = cachedTask?.postId

      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })

      if (postId) {
        void queryClient.invalidateQueries({
          queryKey: postTasksQueryPrefix(postId),
        })
      }

      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({
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
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'allComments'],
      })
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'withComments'],
      })
    },
  })
}

export const usePendingApprovalTasksQuery = () => {
  return useQuery({
    queryKey: ['executor', 'pending-approval-tasks'],
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskList>('/tasks/pending-approval')
      return data
    },
  })
}
