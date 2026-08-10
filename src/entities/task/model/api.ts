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
  type LocalMediaFile,
  type MediaUploadCallbacks,
} from '@/shared/lib/media'
import { fetchAllPages } from '@/shared/lib/pagination/fetchAllPages'

import { toTaskCommentMedia, normalizeTaskWithCommentsItem, getCommentsTailPage, normalizeTaskComment } from './utils'
import { TASK_STATUS_ENUM } from './types'

import type {
  CreateTaskCommentDto,
  CreateTaskDto,
  MarkTaskCommentsReadResponse,
  Task,
  TaskActivityList,
  TaskActivityListParams,
  TaskActivityFeedList,
  TaskActivityFeedParams,
  TaskComment,
  TaskCommentPin,
  TaskCommentAttachmentList,
  TaskCommentAttachmentsParams,
  TaskCommentList,
  TaskCommentListParams,
  TaskCommentFeedList,
  TaskCommentFeedParams,
  TaskWithCommentsParams,
  TaskWithCommentsRawItem,
  TaskWithCommentsList,
  TaskCommentMedia,
  SearchTaskCommentsParams,
  TaskList,
  TaskListParams,
  TaskStats,
  TaskStatsParams,
  TaskCalendarList,
  TaskCalendarParams,
  TaskMediaUploadKind,
  SearchTasksParams,
  RequestTaskAnnulmentDto,
  RequestTaskDeadlineExtensionDto,
  UpdateTaskCommentDto,
  UpdateTaskDto,
} from './types'
import type { TaskMedia, TaskMediaKind } from './types'
import type { UploadMediaResponse } from '@/entities/post'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (params?: TaskListParams) =>
    [...taskKeys.all, 'list', params ?? {}] as const,
  infiniteList: (params?: Omit<TaskListParams, 'page'>) =>
    [...taskKeys.all, 'list', 'infinite', params ?? {}] as const,
  search: (params: SearchTasksParams) =>
    [...taskKeys.all, 'search', params] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  comments: (taskId: string, params?: TaskCommentListParams) =>
    [...taskKeys.all, 'comments', taskId, params ?? {}] as const,
  searchComments: (taskId: string, params: SearchTaskCommentsParams) =>
    [...taskKeys.all, 'comments', taskId, 'search', params] as const,
  commentPins: (taskId: string) =>
    [...taskKeys.all, 'comments', taskId, 'pins'] as const,
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
  pendingApproval: (params?: Omit<TaskListParams, 'page' | 'limit' | 'role'>) =>
    [...taskKeys.all, 'pendingApproval', params ?? {}] as const,
  calendar: (params?: Omit<TaskCalendarParams, 'page' | 'limit'>) =>
    [...taskKeys.all, 'calendar', params ?? {}] as const,
  stats: (params?: TaskStatsParams) =>
    [...taskKeys.all, 'stats', params ?? {}] as const,
}

const postTasksQueryPrefix = (postId: string) =>
  ['posts', 'postTasks', postId] as const

const postTasksQueryRoot = ['posts', 'postTasks'] as const

const findTaskInCache = (
  queryClient: QueryClient,
  taskId: string,
): Task | undefined => {
  const detail = queryClient.getQueryData<Task>(taskKeys.detail(taskId))
  if (detail) return detail

  const lists = queryClient.getQueriesData<TaskList>({
    queryKey: postTasksQueryRoot,
  })

  for (const [, list] of lists) {
    const found = list?.items?.find(item => item.id === taskId)
    if (found) return found
  }

  return undefined
}

const patchTaskInPostTasksCaches = (
  queryClient: QueryClient,
  taskId: string,
  patchTask: (task: Task) => Task,
) => {
  queryClient.setQueriesData<TaskList>({ queryKey: postTasksQueryRoot }, old => {
    if (!old?.items?.length) return old
    if (!old.items.some(item => item.id === taskId)) return old

    return {
      ...old,
      items: old.items.map(item =>
        item.id === taskId ? patchTask(item) : item,
      ),
    }
  })
}

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
    kind: (kind === 'report' ? 'REPORT' : 'MAIN') as TaskMediaKind,
  }))

const getTaskMediaField = (kind: TaskMediaUploadKind) =>
  kind === 'report' ? ('reportMedia' as const) : ('media' as const)

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

  patchTaskInPostTasksCaches(queryClient, taskId, patchTask)
}

export const removeTaskMediaFromCache = (
  queryClient: QueryClient,
  taskId: string,
  mediaId: string,
) => {
  const patchTask = (task: Task): Task => ({
    ...task,
    media: task.media?.filter(
      item => item.id !== mediaId && item.key !== mediaId,
    ),
    reportMedia: task.reportMedia?.filter(
      item => item.id !== mediaId && item.key !== mediaId,
    ),
  })

  queryClient.setQueryData<Task>(taskKeys.detail(taskId), old =>
    old ? patchTask(old) : old,
  )

  patchTaskInPostTasksCaches(queryClient, taskId, patchTask)
}

const invalidateTaskRelatedQueries = async (
  queryClient: QueryClient,
  task: Task,
  options?: { statusChanged?: boolean },
) => {
  const cachedTask =
    queryClient.getQueryData<Task>(taskKeys.detail(task.id)) ??
    findTaskInCache(queryClient, task.id)
  const postId =
    task.postId ||
    task.post?.id ||
    cachedTask?.postId ||
    cachedTask?.post?.id
  const previousPostId = cachedTask?.postId || cachedTask?.post?.id
  const mergedTask: Task = {
    ...cachedTask,
    ...task,
    postId: postId ?? task.postId ?? cachedTask?.postId ?? '',
    executor: task.executorId
      ? (task.executor ?? cachedTask?.executor ?? null)
      : null,
    owner: task.owner ?? cachedTask?.owner,
    post: task.post ?? cachedTask?.post,
  }

  queryClient.setQueryData(taskKeys.detail(task.id), mergedTask)
  patchTaskInPostTasksCaches(queryClient, task.id, () => mergedTask)

  void queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) })
  void queryClient.invalidateQueries({ queryKey: [...taskKeys.all, 'list'] })
  void queryClient.invalidateQueries({
    queryKey: [...taskKeys.all, 'allActivities'],
  })
  void queryClient.invalidateQueries({
    queryKey: [...taskKeys.all, 'calendar'],
  })
  void queryClient.invalidateQueries({
    queryKey: [...taskKeys.all, 'search'],
  })

  // После смены статуса сразу refetch activities — кнопки «чей ход» зависят от last actor
  if (options?.statusChanged) {
    await queryClient.refetchQueries({
      queryKey: [...taskKeys.all, 'activities', task.id],
    })
  } else {
    void queryClient.invalidateQueries({
      queryKey: [...taskKeys.all, 'activities', task.id],
    })
  }

  const postIds = new Set(
    [postId, previousPostId].filter((id): id is string => Boolean(id)),
  )

  for (const id of postIds) {
    void queryClient.invalidateQueries({
      queryKey: postTasksQueryPrefix(id),
    })
  }

  // Fallback: postId unknown — still refresh all post-task lists
  if (!postIds.size) {
    void queryClient.invalidateQueries({ queryKey: postTasksQueryRoot })
  }

  const hasParticipantChanged =
    cachedTask?.executorId !== task.executorId ||
    cachedTask?.ownerId !== task.ownerId

  if (hasParticipantChanged) {
    const participantIds = new Set(
      [
        cachedTask?.executorId,
        cachedTask?.ownerId,
        task.executorId,
        task.ownerId,
      ].filter((id): id is string => Boolean(id)),
    )

    for (const userId of participantIds) {
      void queryClient.invalidateQueries({ queryKey: ['user', userId] })
    }
  }

  void queryClient.invalidateQueries({ queryKey: taskKeys.pendingApproval() })
  void queryClient.invalidateQueries({
    queryKey: [...taskKeys.all, 'stats'],
  })

  // Backend may create a publication when task becomes COMPLETED
  if (
    task.status === TASK_STATUS_ENUM.COMPLETED &&
    cachedTask?.status !== TASK_STATUS_ENUM.COMPLETED
  ) {
    void queryClient.invalidateQueries({ queryKey: ['publications'] })
  }
}

export const serializeTaskListParams = (
  params: TaskListParams,
): Record<string, string> => {
  const serialized: Record<string, string> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue

    serialized[key] = value === null ? 'null' : String(value)
  }

  const hasCalendarDayFilter =
    params.createdDate !== undefined ||
    params.updatedDate !== undefined ||
    params.deadlineDate !== undefined ||
    params.dateFrom !== undefined ||
    params.dateTo !== undefined

  if (hasCalendarDayFilter && params.tzOffset === undefined) {
    serialized.tzOffset = String(new Date().getTimezoneOffset())
  }

  return serialized
}

export const fetchTasksList = async (params?: TaskListParams) => {
  const { data } = await mainAxios.get<TaskList>('/tasks', {
    params: params ? serializeTaskListParams(params) : undefined,
  })

  return data
}

export const getTasksListNextPageParam = (lastPage: TaskList | undefined) => {
  if (!lastPage?.page || !lastPage?.limit || lastPage.total == null) {
    return undefined
  }

  return lastPage.page * lastPage.limit < lastPage.total
    ? lastPage.page + 1
    : undefined
}

export const useTasksQuery = (
  params?: TaskListParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => fetchTasksList(params),
    refetchOnWindowFocus: true,
    enabled: options?.enabled ?? true,
  })

export const useTasksInfiniteQuery = (
  params?: Omit<TaskListParams, 'page'>,
  options?: { enabled?: boolean; limit?: number },
) => {
  const limit = options?.limit ?? params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: taskKeys.infiniteList({ ...params, limit }),
    queryFn: async ({ pageParam }) =>
      fetchTasksList({
        ...params,
        page: pageParam,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: getTasksListNextPageParam,
    refetchOnWindowFocus: true,
    enabled: options?.enabled ?? true,
  })
}

export const fetchTasksCalendar = async (
  params?: Omit<TaskCalendarParams, 'page' | 'limit'>,
) =>
  fetchAllPages(async (page, limit) => {
    const { data } = await mainAxios.get<TaskCalendarList>('/tasks/calendar', {
      params: { ...params, page, limit },
    })

    return data
  }, 20)

export const useTasksCalendarQuery = (
  params?: Omit<TaskCalendarParams, 'page' | 'limit'>,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: taskKeys.calendar(params),
    queryFn: () => fetchTasksCalendar(params),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
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

export const fetchAllTasks = async (
  params?: Omit<TaskListParams, 'page' | 'limit'>,
) =>
  fetchAllPages(async (page, limit) => {
    return fetchTasksList({ ...params, page, limit })
  })

export const fetchTaskStats = async (params?: TaskStatsParams) => {
  const { data } = await mainAxios.get<TaskStats>('/tasks/stats', { params })

  return data
}

export const useTaskStatsQuery = (
  params?: TaskStatsParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: taskKeys.stats(params),
    queryFn: () => fetchTaskStats(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: options?.enabled ?? true,
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
    queryFn: () => fetchTaskById(id!),
    enabled: Boolean(id) && !skip,
  })

export const fetchTaskById = async (id: string) => {
  const { data } = await mainAxios.get<Task>(`/tasks/${id}`)
  return data
}

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateTaskDto }) => {
      const { data } = await mainAxios.patch<Task>(`/tasks/${id}`, body)
      return data
    },
    onSuccess: async (task, { id, body }) => {
      const cachedTask = queryClient.getQueryData<Task>(taskKeys.detail(id))
      const previousPostId = cachedTask?.postId || cachedTask?.post?.id
      const statusChanged =
        Boolean(body.status) && cachedTask?.status !== task.status

      await invalidateTaskRelatedQueries(queryClient, task, { statusChanged })

      if (
        body.postId &&
        previousPostId &&
        previousPostId !== body.postId
      ) {
        void queryClient.invalidateQueries({
          queryKey: postTasksQueryPrefix(previousPostId),
        })
      }

      if (body.postId) {
        void queryClient.invalidateQueries({
          queryKey: ['posts', 'postTasks'],
        })
      }
    },
  })
}

export const useRequestTaskAnnulmentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: RequestTaskAnnulmentDto
    }) => {
      const { data } = await mainAxios.post<Task>(`/tasks/${id}/annulment`, body)
      return data
    },
    onSuccess: task => {
      invalidateTaskRelatedQueries(queryClient, task)
    },
  })
}

export const useConfirmTaskAnnulmentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mainAxios.post<Task>(
        `/tasks/${id}/annulment/confirm`,
      )
      return data
    },
    onSuccess: task => {
      invalidateTaskRelatedQueries(queryClient, task)
    },
  })
}

export const useRejectTaskAnnulmentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mainAxios.post<Task>(
        `/tasks/${id}/annulment/reject`,
      )
      return data
    },
    onSuccess: task => {
      invalidateTaskRelatedQueries(queryClient, task)
    },
  })
}

export const useRequestTaskDeadlineExtensionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: RequestTaskDeadlineExtensionDto
    }) => {
      const { data } = await mainAxios.post<Task>(
        `/tasks/${id}/deadline-extension`,
        body,
      )
      return data
    },
    onSuccess: task => {
      invalidateTaskRelatedQueries(queryClient, task)
    },
  })
}

export const useConfirmTaskDeadlineExtensionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mainAxios.post<Task>(
        `/tasks/${id}/deadline-extension/confirm`,
      )
      return data
    },
    onSuccess: task => {
      invalidateTaskRelatedQueries(queryClient, task)
    },
  })
}

export const useRejectTaskDeadlineExtensionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mainAxios.post<Task>(
        `/tasks/${id}/deadline-extension/reject`,
      )
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
    onSuccess: (task, variables) => {
      const postId = task.postId || task.post?.id || variables.postId
      const createdTask = { ...task, postId }

      invalidateTaskRelatedQueries(queryClient, createdTask)

      queryClient.setQueriesData<TaskList>(
        { queryKey: postTasksQueryPrefix(postId) },
        old => {
          if (!old) {
            return {
              items: [createdTask],
              total: 1,
              page: 1,
              limit: 20,
            }
          }

          if (old.items.some(item => item.id === createdTask.id)) {
            return old
          }

          return {
            ...old,
            items: [createdTask, ...old.items],
            total: old.total + 1,
          }
        },
      )

      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
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
        {
          params: {
            ...params,
            markRead: params?.markRead ?? true,
          },
        },
      )
      return {
        ...data,
        items: data.items.map(normalizeTaskComment),
      }
    },
    enabled: Boolean(taskId),
  })

export const fetchTaskCommentsPage = async (
  taskId: string,
  page: number,
  limit: number,
  markRead = true,
) => {
  const { data } = await mainAxios.get<TaskCommentList>(
    `/tasks/${taskId}/comments`,
    { params: { page, limit, markRead } },
  )

  return {
    ...data,
    items: data.items.map(normalizeTaskComment),
  }
}

export const useAllTaskCommentsQuery = (
  taskId: string | null,
  enabled = true,
) =>
  useQuery({
    queryKey: [...taskKeys.comments(taskId ?? ''), 'all'] as const,
    queryFn: async () => {
      const items = await fetchAllPages(
        (page, limit) => fetchTaskCommentsPage(taskId!, page, limit),
        100,
      )

      return [...items].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      )
    },
    enabled: enabled && Boolean(taskId),
  })

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
        { params: { page: 1, limit: 1, markRead: true } },
      )

      const page = getCommentsTailPage(Math.max(meta.total, 1), limit)

      const { data } = await mainAxios.get<TaskCommentList>(
        `/tasks/${taskId}/comments`,
        { params: { page, limit, markRead: true } },
      )

      const items = data.items.map(normalizeTaskComment)

      const hasLastComment =
        !lastCommentId ||
        items.some(comment => comment.id === lastCommentId)

      if (hasLastComment || page === 1) {
        return { ...data, items }
      }

      const { data: newestPage } = await mainAxios.get<TaskCommentList>(
        `/tasks/${taskId}/comments`,
        { params: { page: 1, limit, markRead: true } },
      )

      return {
        ...newestPage,
        items: newestPage.items.map(normalizeTaskComment),
      }
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
      return {
        ...data,
        items: data.items.map(normalizeTaskComment),
      }
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

const patchAllTaskCommentsCache = (
  queryClient: QueryClient,
  taskId: string,
  updater: (comments: TaskComment[]) => TaskComment[],
) => {
  queryClient.setQueriesData<TaskComment[]>(
    { queryKey: [...taskKeys.comments(taskId), 'all'] },
    old => (old ? updater(old) : old),
  )
}

export const appendTaskCommentToCache = (
  queryClient: QueryClient,
  comment: TaskComment,
) => {
  const normalized = normalizeTaskComment(comment)

  patchAllTaskCommentsCache(queryClient, normalized.taskId, comments => {
    if (comments.some(item => item.id === normalized.id)) {
      return comments.map(item =>
        item.id === normalized.id ? normalized : item,
      )
    }

    return [...comments, normalized].sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    )
  })
}

export const updateTaskCommentInCache = (
  queryClient: QueryClient,
  comment: TaskComment,
) => {
  const normalized = normalizeTaskComment(comment)

  patchAllTaskCommentsCache(queryClient, normalized.taskId, comments =>
    comments.map(item => (item.id === normalized.id ? normalized : item)),
  )
}

export const removeTaskCommentFromCache = (
  queryClient: QueryClient,
  taskId: string,
  commentId: string,
) => {
  patchAllTaskCommentsCache(queryClient, taskId, comments =>
    comments.filter(item => item.id !== commentId),
  )
}

export const applyTaskCommentsReadInCache = (
  queryClient: QueryClient,
  taskId: string,
  readAt: string,
  currentUserId: string,
) => {
  const readAtTime = new Date(readAt).getTime()

  patchAllTaskCommentsCache(queryClient, taskId, comments =>
    comments.map(comment =>
      comment.authorId === currentUserId &&
      new Date(comment.createdAt).getTime() <= readAtTime
        ? { ...comment, isRead: true }
        : comment,
    ),
  )
}

export const setTaskWithCommentsUnread = (
  queryClient: QueryClient,
  taskId: string,
  unreadCount: number,
) => {
  queryClient.setQueriesData<{
    pages: TaskWithCommentsList[]
    pageParams: unknown[]
  }>({ queryKey: [...taskKeys.all, 'withComments'] }, old => {
    if (!old?.pages) return old

    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        items: page.items.map(item =>
          item.id === taskId ? { ...item, unreadCount } : item,
        ),
      })),
    }
  })
}

export const getTaskWithCommentsUnread = (
  queryClient: QueryClient,
  taskId: string,
): number => {
  const queries = queryClient.getQueriesData<{
    pages: TaskWithCommentsList[]
    pageParams: unknown[]
  }>({ queryKey: [...taskKeys.all, 'withComments'] })

  for (const [, data] of queries) {
    const item = data?.pages
      ?.flatMap(page => page.items)
      .find(entry => entry.id === taskId)

    if (item) {
      return item.unreadCount ?? 0
    }
  }

  return 0
}

export const incrementTaskWithCommentsUnread = (
  queryClient: QueryClient,
  taskId: string,
) => {
  queryClient.setQueriesData<{
    pages: TaskWithCommentsList[]
    pageParams: unknown[]
  }>({ queryKey: [...taskKeys.all, 'withComments'] }, old => {
    if (!old?.pages) return old

    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        items: page.items.map(item =>
          item.id === taskId
            ? { ...item, unreadCount: (item.unreadCount ?? 0) + 1 }
            : item,
        ),
      })),
    }
  })
}

export const markTaskCommentsRead = async (taskId: string) => {
  const { data } = await mainAxios.post<MarkTaskCommentsReadResponse>(
    `/tasks/${taskId}/comments/read`,
  )
  return data
}

export const useMarkTaskCommentsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => markTaskCommentsRead(taskId),
    onSuccess: data => {
      setTaskWithCommentsUnread(queryClient, data.taskId, 0)
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, 'withComments'],
      })
    },
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
      return normalizeTaskComment(data)
    },
    onSuccess: (comment, { taskId }) => {
      appendTaskCommentToCache(queryClient, comment)
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
      return normalizeTaskComment(data)
    },
    onSuccess: (comment, { taskId }) => {
      updateTaskCommentInCache(queryClient, comment)
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

export const useTaskCommentPinsQuery = (taskId: string | null) =>
  useQuery({
    queryKey: taskKeys.commentPins(taskId ?? ''),
    queryFn: async () => {
      const { data } = await mainAxios.get<TaskCommentPin[]>(
        `/tasks/${taskId}/comments/pins`,
        { params: { limit: 50 } },
      )
      return data
    },
    enabled: Boolean(taskId),
  })

export const usePinTaskCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      commentId,
      isPinned,
    }: {
      taskId: string
      commentId: string
      isPinned: boolean
    }) => {
      await mainAxios.patch(
        `/tasks/${taskId}/comments/${commentId}/pin`,
        { isPinned },
      )
    },
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.commentPins(taskId),
      })
    },
  })
}

export type UploadMediaOptions = {
  alreadyPrepared?: boolean
  onProgress?: (progress: number) => void
}

export const uploadTaskMedia = async (
  taskId: string,
  file: File,
  kind: TaskMediaUploadKind = 'main',
  options?: UploadMediaOptions,
) => {
  const prepared = options?.alreadyPrepared
    ? file
    : await prepareFileForUpload(file)
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
      onUploadProgress: event => {
        if (!options?.onProgress || !event.total) return
        options.onProgress(Math.round((event.loaded / event.total) * 100))
      },
    },
  )

  return data
}

export const uploadTaskMediaBatch = async (
  taskId: string,
  files: File[] | LocalMediaFile[],
  kind: TaskMediaUploadKind = 'main',
  callbacks?: MediaUploadCallbacks,
) => {
  type UploadResult =
    | { ok: true; localId: string; data: UploadMediaResponse }
    | { ok: false; localId: string; error: Error }

  const normalizedFiles = files as Array<File | LocalMediaFile>

  const results = await mapInBatches<File | LocalMediaFile, UploadResult>(
    normalizedFiles,
    async (item, index) => {
      const isLocal = !(item instanceof File)
      const file = isLocal ? item.file : item
      const localId = isLocal ? item.localId : `file-${index}`

      callbacks?.onFileStart?.(localId)

      try {
        const data = await uploadTaskMedia(taskId, file, kind, {
          alreadyPrepared: isLocal ? item.prepared : false,
          onProgress: progress =>
            callbacks?.onFileProgress?.(localId, progress),
        })
        callbacks?.onFileSuccess?.(localId)
        return { ok: true, localId, data }
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Не удалось загрузить файл')
        callbacks?.onFileError?.(localId, err)
        return { ok: false, localId, error: err }
      }
    },
    MEDIA_UPLOAD_CONCURRENCY,
  )

  const uploads = results
    .filter((result): result is Extract<UploadResult, { ok: true }> => result.ok)
    .map(result => result.data)

  const failures = results.filter(
    (result): result is Extract<UploadResult, { ok: false }> => !result.ok,
  )

  if (!uploads.length && failures.length) {
    throw failures[0].error
  }

  return uploads
}

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
      callbacks,
    }: {
      taskId: string
      files: File[] | LocalMediaFile[]
      kind?: TaskMediaUploadKind
      callbacks?: MediaUploadCallbacks
    }) => uploadTaskMediaBatch(taskId, files, kind, callbacks),
    onSuccess: (uploads, { taskId, kind }) => {
      mergeUploadedMediaIntoTaskCache(queryClient, taskId, uploads, kind ?? 'main')

      const cachedTask = findTaskInCache(queryClient, taskId)
      const postId = cachedTask?.postId || cachedTask?.post?.id

      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })

      if (postId) {
        void queryClient.invalidateQueries({
          queryKey: postTasksQueryPrefix(postId),
        })
      } else {
        void queryClient.invalidateQueries({ queryKey: postTasksQueryRoot })
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
      removeTaskCommentFromCache(queryClient, taskId, commentId)
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

export const usePendingApprovalTasksQuery = (
  params?: Omit<TaskListParams, 'page' | 'limit' | 'role'>,
) =>
  useQuery({
    queryKey: taskKeys.pendingApproval(params),
    queryFn: async () => {
      const items = await fetchAllPages(async (page, limit) => {
        const { data } = await mainAxios.get<TaskList>('/tasks/pending-approval', {
          params: { ...params, page, limit },
        })

        return data
      })

      return items
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
