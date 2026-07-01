
export type TaskStatus =
  | 'PREPARING'
  | 'PENDING_APPROVAL'
  | 'IN_PROGRESS'
  | 'REVISION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CHECKING'
  | 'CANCELLED_EXECUTOR'

export enum TASK_STATUS_ENUM {
  PREPARING = 'PREPARING',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  IN_PROGRESS = 'IN_PROGRESS',
  REVISION = 'REVISION',
  COMPLETED = 'COMPLETED',
  CHECKING = 'CHECKING',
  CANCELLED = 'CANCELLED',
  CANCELLED_EXECUTOR = 'CANCELLED_EXECUTOR',
}

export type TaskRole = 'owner' | 'executor'

export type TaskCommentMedia = {
  url: string
  key: string
  size: string
  mimeType: string
}

export type TaskComment = {
  id: string
  taskId: string
  authorId: string
  content: string
  media?: TaskCommentMedia[]
  createdAt: string
  updatedAt: string
}

export type TaskMediaKind = 'MAIN' | 'REPORT'

export type TaskMediaUploadKind = 'main' | 'report'

export type TaskMedia = {
  id: string
  url: string
  key: string
  size: string
  mimeType: string
  kind?: TaskMediaKind
}

export type Post = {
  id: string
  ownerId: string
  title: string
  type: string
  isPrivate: boolean
}

export type Owner = {
  id: string
  avatar: string
  creatorProfile: CreatorProfile
  companyProfile: CompanyProfile
}

export type CreatorProfile = {
  name: string
  lastName: string
}

export type CompanyProfile = {
  companyName: string
}

export type Executor = {
  avatar: string
  id: string
  lastName: string
  name: string
  role: string
}

export type Task = {
  id: string
  title: string
  applicationId: string
  postId: string
  ownerId: string
  executorId: string
  status: TaskStatus
  media: TaskMedia[]
  reportMedia?: TaskMedia[]
  description: string
  finalDate: string | null
  photoCount: string
  videoCount: string
  urgent: boolean
  createdAt: string
  updatedAt: string
  isExecutorApprove?: boolean
  comments?: TaskComment[]
  executor?: Executor
  post?: Post
  owner?: Owner
  isCompanyAction?: boolean
}

export type TaskList = {
  page: number
  items: Task[]
  total: number
  limit: number
}

export type TaskCommentList = {
  page: number
  total: number
  limit: number
  items: TaskComment[]
}

export type TaskListParams = {
  page?: number
  limit?: number
  role?: TaskRole
  postId?: string
  status?: TaskStatus
  updatedDate?: string
}

export type SearchTasksParams = {
  q: string
  page?: number
  limit?: number
}

export type TaskCommentListParams = {
  page?: number
  limit?: number
}

export type TaskCommentFeedParams = {
  page?: number
  limit?: number
  role?: TaskRole
  taskId?: string
  q?: string
}

export type TaskCommentFeedItem = TaskComment & {
  task?: TaskActivityFeedTask
}

export type TaskCommentFeedList = {
  page: number
  total: number
  limit: number
  items: TaskCommentFeedItem[]
}

export type TaskWithCommentsParams = {
  page?: number
  limit?: number
  role?: TaskRole
  postId?: string
  status?: TaskStatus
  q?: string
  readAfter?: string
}

export type TaskWithCommentsItem = {
  id: string
  title?: string | null
  ownerId: string
  executorId?: string | null
  postId?: string
  status?: TaskStatus
  isExecutorApprove?: boolean | null
  post?: Pick<Post, 'id' | 'title'>
  lastComment: TaskComment
  commentsCount: number
  unreadCount?: number
}

export type TaskWithCommentsRawItem = TaskWithCommentsItem & {
  taskId?: string
  task?: {
    id?: string
    title?: string | null
    ownerId?: string
    executorId?: string | null
    postId?: string
    status?: TaskStatus
    isExecutorApprove?: boolean | null
    post?: Pick<Post, 'id' | 'title'>
  }
}

export type TaskWithCommentsList = {
  items: TaskWithCommentsItem[]
  total: number
  page: number
  limit: number
}

export type TaskCommentAttachment = {
  url: string
  key: string
  size: string
  authorId: string
  mimeType: string
  commentId: string
  createdAt: string
}

export type TaskCommentAttachmentList = {
  page: number
  total: number
  limit: number
  items: TaskCommentAttachment[]
}

export type SearchTaskCommentsParams = {
  q: string
  page?: number
  limit?: number
}

export type TaskCommentAttachmentsParams = {
  page?: number
  limit?: number
  type?: 'image' | 'video' | 'document'
}

export type TaskActivityPayload = {
  to?: string | null
  from?: string | null
  field?: string
  key?: string
  url?: string
  kind?: string
  size?: string
  mediaId?: string
  mimeType?: string
}


export type TaskActivity = {
  id: string
  taskId: string
  actorId: string
  createdAt: string
  type: TaskActivityType
  payload: TaskActivityPayload
}

export type TaskActivityList = {
  items: TaskActivity[]
  total: number
  page: number
  limit: number
}

export type TaskActivityListParams = {
  page?: number
  limit?: number
  type?: TaskActivityType
}

export type TaskActivityFeedParams = TaskActivityListParams & {
  role?: TaskRole
  taskId?: string
}

export type TaskActivityFeedTask = {
  id: string
  title?: string
  ownerId: string
  executorId?: string | null
  postId?: string
  post?: Pick<Post, 'id' | 'title'>
}

export type TaskActivityFeedItem = TaskActivity & {
  task?: TaskActivityFeedTask
}

export type TaskActivityFeedList = {
  items: TaskActivityFeedItem[]
  total: number
  page: number
  limit: number
}

export enum TaskActivityType {
  MEDIA_ADDED = 'MEDIA_ADDED',
  FIELD_UPDATED = 'FIELD_UPDATED',
  MEDIA_REMOVED = 'MEDIA_REMOVED',
  STATUS_CHANGED = 'STATUS_CHANGED',
}

export const TASK_ACTIVITY_LABELS: Record<TaskActivityType, string> = {
  [TaskActivityType.STATUS_CHANGED]: 'Изменен статус',
  [TaskActivityType.FIELD_UPDATED]: 'Изменено поле',
  [TaskActivityType.MEDIA_ADDED]: 'Загружено медиа',
  [TaskActivityType.MEDIA_REMOVED]: 'Удалено медиа',
} as const

export type UpdateTaskDto = {
  title?: string
  status?: TaskStatus
  media?: string[]
  description?: string
  finalDate?: string | null
  photoCount?: string
  videoCount?: string
  urgent?: boolean
  executorId?: string
  isExecutorApprove?: boolean | null
  isCompanyAction?: boolean
}

export type CreateTaskDto = {
  postId: string
  executorId?: string
}

export type CreateTaskCommentDto = {
  content: string
  media?: TaskCommentMedia[]
}

export type UpdateTaskCommentDto = {
  content: string
}