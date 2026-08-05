
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
  | 'CHECKING'
  | 'ANNULLED'

export enum TASK_STATUS_ENUM {
  PREPARING = 'PREPARING',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  IN_PROGRESS = 'IN_PROGRESS',
  REVISION = 'REVISION',
  COMPLETED = 'COMPLETED',
  CHECKING = 'CHECKING',
  ANNULLED = 'ANNULLED',
}

export type TaskAnnulmentInitiator = 'CUSTOMER' | 'EXECUTOR' | 'MUTUAL'

export type TaskAnnulmentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

export type TaskAnnulment = {
  id: string
  reason: string
  initiator: TaskAnnulmentInitiator
  requestedAt: string
  requestedById: string
  status: TaskAnnulmentStatus
  confirmedAt: string | null
  confirmedById: string | null
}

export type RequestTaskAnnulmentDto = {
  reason: string
  initiator: TaskAnnulmentInitiator
}

export type TaskDeadlineExtensionStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

export type TaskDeadlineExtension = {
  id: string
  reason: string
  initiator: TaskAnnulmentInitiator
  proposedFinalDate: string
  requestedAt: string
  requestedById: string
  status: TaskDeadlineExtensionStatus
  confirmedAt: string | null
  confirmedById: string | null
}

export type RequestTaskDeadlineExtensionDto = {
  reason: string
  initiator: TaskAnnulmentInitiator
  proposedFinalDate: string
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
  editedAt: string | null
  isRead: boolean
  actorAccountId?: string | null
  actorDisplayName?: string | null
  actorKind?: 'OWNER' | 'MANAGER' | null
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
  createdActorAccountId?: string | null
  createdActorDisplayName?: string | null
  createdActorKind?: 'OWNER' | 'MANAGER' | null
  lastActorAccountId?: string | null
  lastActorDisplayName?: string | null
  lastActorKind?: 'OWNER' | 'MANAGER' | null
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
  annulment?: TaskAnnulment | null
  annulments?: TaskAnnulment[]
  deadlineExtension?: TaskDeadlineExtension | null
  deadlineExtensions?: TaskDeadlineExtension[]
  /** Account ответственного (кто создал задачу / принял отклик) */
  assigneeAccountId?: string | null
  assigneeDisplayName?: string | null
  assigneeKind?: 'OWNER' | 'MANAGER' | null
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
  updatedDate?: string
  deadlineDate?: string
  dateFrom?: string
  dateTo?: string
  /** Minutes, same as `Date#getTimezoneOffset()` */
  tzOffset?: number
  dateField?: TaskCalendarDateField
  urgent?: boolean
  ownerId?: string
  executorId?: string
  taskId?: string
  q?: string
  personQ?: string
  personField?: 'executor' | 'owner'
  /** Только задачи, где текущий аккаунт — ответственный */
  assigneeMine?: boolean
  /** Фильтр по конкретному ответственному (accountId) */
  assigneeAccountId?: string
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
  executorId?: string
  ownerId?: string
  dateFrom?: string
  dateTo?: string
  dateField?: TaskCalendarDateField
  assigneeMine?: boolean
  assigneeAccountId?: string
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
  postId?: string
  role?: TaskRole
  page?: number
  limit?: number
  assigneeMine?: boolean
  assigneeAccountId?: string
}

export type TaskCommentListParams = {
  page?: number
  limit?: number
  markRead?: boolean
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
  taskId?: string
  status?: TaskStatus
  q?: string
}

export type TaskLastCommentPreview = {
  preview: string
  createdAt: string
  authorId: string
}

export type TaskWithCommentsRecipient = {
  id: string
  displayName: string
  avatar: string | null
}

export type TaskWithCommentsItem = {
  id: string
  title?: string | null
  ownerId?: string
  executorId?: string | null
  postId?: string
  status?: TaskStatus
  isExecutorApprove?: boolean | null
  post?: Pick<Post, 'id' | 'title'>
  recipient: TaskWithCommentsRecipient | null
  lastComment: TaskLastCommentPreview
  commentsCount: number
  unreadCount: number
}

export type TaskWithCommentsRawItem = Omit<TaskWithCommentsItem, 'id' | 'lastComment' | 'recipient'> & {
  id?: string
  taskId?: string
  recipient?: TaskWithCommentsRecipient | null
  lastComment: TaskLastCommentPreview & {
    /** @deprecated полный комментарий больше не отдаётся в with-comments */
    id?: string
    taskId?: string
    content?: string
    media?: TaskCommentMedia[]
  }
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
  to?: unknown
  from?: unknown
  field?: string
  key?: string
  url?: string
  kind?: string
  size?: string
  mediaId?: string
  mimeType?: string
  requestId?: string
  reason?: string
  initiator?: string
  proposedFinalDate?: string
}


export type TaskActivity = {
  id: string
  taskId: string
  actorId: string
  createdAt: string
  type: TaskActivityType
  payload: TaskActivityPayload
  actorAccountId?: string | null
  actorDisplayName?: string | null
  actorKind?: 'OWNER' | 'MANAGER' | null
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
  ANNULMENT_REQUESTED = 'ANNULMENT_REQUESTED',
  ANNULMENT_CONFIRMED = 'ANNULMENT_CONFIRMED',
  ANNULMENT_REJECTED = 'ANNULMENT_REJECTED',
  DEADLINE_EXTENSION_REQUESTED = 'DEADLINE_EXTENSION_REQUESTED',
  DEADLINE_EXTENSION_CONFIRMED = 'DEADLINE_EXTENSION_CONFIRMED',
  DEADLINE_EXTENSION_REJECTED = 'DEADLINE_EXTENSION_REJECTED',
}

export const TASK_ACTIVITY_LABELS: Record<TaskActivityType, string> = {
  [TaskActivityType.STATUS_CHANGED]: 'Изменен статус',
  [TaskActivityType.FIELD_UPDATED]: 'Изменено поле',
  [TaskActivityType.MEDIA_ADDED]: 'Загружено медиа',
  [TaskActivityType.MEDIA_REMOVED]: 'Удалено медиа',
  [TaskActivityType.ANNULMENT_REQUESTED]: 'Запрос аннулирования',
  [TaskActivityType.ANNULMENT_CONFIRMED]: 'Аннулирование подтверждено',
  [TaskActivityType.ANNULMENT_REJECTED]: 'Аннулирование отклонено',
  [TaskActivityType.DEADLINE_EXTENSION_REQUESTED]: 'Запрос переноса дедлайна',
  [TaskActivityType.DEADLINE_EXTENSION_CONFIRMED]: 'Перенос дедлайна подтверждён',
  [TaskActivityType.DEADLINE_EXTENSION_REJECTED]: 'Перенос дедлайна отклонён',
} as const

export type UpdateTaskDto = {
  title?: string | null
  status?: TaskStatus
  description?: string
  finalDate?: string | null
  photoCount?: string
  videoCount?: string
  urgent?: boolean
  postId?: string
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
  content?: string
  media?: TaskCommentMedia[]
}

export type UpdateTaskCommentDto = {
  content: string
}

export type MarkTaskCommentsReadResponse = {
  taskId: string
  readAt: string
}

export type TaskCommentsReadEvent = {
  taskId: string
  userId: string
  readAt: string
}

export type TaskCommentDeletedEvent = {
  taskId: string
  commentId: string
}