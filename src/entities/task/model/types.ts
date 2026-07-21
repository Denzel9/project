
import type { ApplicationStatus } from '@/entities/application'
import type {
  BloggerRequirements,
  CooperationDetails,
  PlacementFormat,
  Platform,
  Post,
  PostBrief,
  PostDeliverable,
  PostLocation,
} from '@/entities/post'
import type { CompanyProfile, CreatorProfile } from '@/entities/user'

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
  id?: string
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
  kind: TaskMediaKind
}

export type TaskApplication = {
  id: string
  postId: string
  message: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export type TaskPublication = {
  id: string
  taskId: string
  postId: string
  title: string | null
  description: string
  externalUrl?: string | null
  platform?: Platform | null
  brief?: PostBrief | null
  deliverables?: PostDeliverable[] | null
  location?: PostLocation | null
  status: 'PUBLISHED'
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export type Owner = {
  id: string
  avatar: string
  isVerified?: boolean
  isEmailConfirmed?: boolean
  creatorProfile: CreatorProfile
  companyProfile: CompanyProfile
}

export type Executor = {
  avatar: string
  id: string
  lastName: string
  name: string
  role: string
  isVerified?: boolean
  isEmailConfirmed?: boolean
}

export type Task = {
  id: string
  applicationId: string | null
  application?: TaskApplication | null
  postId: string
  post?: Post | null
  ownerId: string
  owner?: Owner | null
  executorId: string | null
  executor?: Executor | null
  status: TaskStatus
  title: string | null
  description: string
  finalDate: string | null
  photoCount: string
  videoCount: string
  urgent: boolean
  isExecutorApprove: boolean | null
  isCompanyAction: boolean
  location?: PostLocation | null
  bloggerRequirements?: BloggerRequirements | null
  cooperationDetails?: CooperationDetails | null
  brief?: PostBrief | null
  deliverables?: PostDeliverable[] | null
  media: TaskMedia[]
  reportMedia?: TaskMedia[]
  activities?: TaskActivity[]
  publication?: TaskPublication | null
  createdAt: string
  updatedAt: string
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
  statuses?: string
  active?: boolean
  excludeCompleted?: boolean
  isCompanyAction?: boolean
  isExecutorApprove?: boolean | null
  unassigned?: boolean
  overdue?: boolean
  createdDate?: string
  dateFrom?: string
  dateTo?: string
  dateField?: TaskCalendarDateField
  urgent?: boolean
  ownerId?: string
  executorId?: string
  q?: string
}

export type TaskStats = {
  awaitingAction: number
  awaitingConfirmation: number
  unassigned: number
  overdue: number
  urgent: number
  underReview: number
  cancelled: number
}

export type TaskStatsParams = {
  role?: TaskRole
  postId?: string
}

export type SearchTasksParams = {
  q: string
  page?: number
  limit?: number
}

export type TaskCalendarDateField = 'createdAt' | 'updatedAt' | 'finalDate'

export type TaskCalendarOwner = {
  id: string
  avatar?: string
  creatorProfile?: CreatorProfile
  companyProfile?: CompanyProfile
}

export type TaskCalendarExecutor = {
  id: string
  avatar?: string
  name?: string
  lastName?: string
}

export type TaskCalendarItem = {
  id: string
  postId?: string
  createdAt: string
  updatedAt: string
  urgent: boolean
  finalDate: string | null
  title: string | null
  platforms?: Platform[]
  placementFormats?: PlacementFormat[]
  owner?: TaskCalendarOwner
  executor?: TaskCalendarExecutor
}

export type TaskCalendarList = {
  page: number
  items: TaskCalendarItem[]
  total: number
  limit: number
}

export type TaskCalendarParams = {
  dateFrom?: string
  dateTo?: string
  dateField?: TaskCalendarDateField
  urgent?: boolean
  ownerId?: string
  executorId?: string
  role?: TaskRole
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
  id: string
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
  title?: string | null
  status?: TaskStatus
  description?: string
  finalDate?: string | null
  photoCount?: string
  videoCount?: string
  urgent?: boolean
  executorId?: string | null
  isExecutorApprove?: boolean | null
  isCompanyAction?: boolean
  location?: PostLocation | null
  bloggerRequirements?: BloggerRequirements | null
  cooperationDetails?: CooperationDetails | null
  brief?: PostBrief | null
  deliverables?: PostDeliverable[] | null
}

export type CreateTaskDto = {
  postId: string
  executorId?: string
  title?: string | null
  description?: string
  status?: TaskStatus
  finalDate?: string | null
  photoCount?: string
  videoCount?: string
  urgent?: boolean
  isExecutorApprove?: boolean | null
  isCompanyAction?: boolean
  location?: PostLocation | null
  bloggerRequirements?: BloggerRequirements | null
  cooperationDetails?: CooperationDetails | null
  brief?: PostBrief | null
  deliverables?: PostDeliverable[] | null
  media?: TaskMedia[] | null
}

export type CreateTaskCommentDto = {
  content: string
  media?: TaskCommentMedia[]
}

export type UpdateTaskCommentDto = {
  content: string
}