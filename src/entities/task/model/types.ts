
export type TaskStatus =
  | 'PREPARING'
  | 'PENDING_APPROVAL'
  | 'IN_PROGRESS'
  | 'REVISION'
  | 'COMPLETED'
  | 'CANCELLED'

export enum TASK_STATUS_ENUM {
  PREPARING = 'PREPARING',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  IN_PROGRESS = 'IN_PROGRESS',
  REVISION = 'REVISION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type TaskRole = 'owner' | 'executor'

export type TaskComment = {
  id: string
  taskId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
}

export type TaskMedia = {
  id: string
  url: string
  key: string
  size: string
  mimeType: string
}

export type Task = {
  id: string
  applicationId: string
  postId: string
  ownerId: string
  executorId: string
  status: TaskStatus
  media: TaskMedia[]
  description: string
  finalDate: string | null
  photoCount: string
  videoCount: string
  urgent: boolean
  createdAt: string
  updatedAt: string
  comments?: TaskComment[]
  post: {
    id: string
    ownerId: string
    title: string
    type: string
  }
  owner: {
    id: string
    avatar: string
    creatorProfile: {
      name: string
      lastName: string
    }
    companyProfile: {
      companyName: string
    }
  }
}

export type TaskList = {
  items: Task[]
  total: number
  page: number
  limit: number
}

export type TaskCommentList = {
  items: TaskComment[]
  total: number
  page: number
  limit: number
}

export type TaskListParams = {
  role?: TaskRole
  status?: TaskStatus
  page?: number
  limit?: number
}

export type TaskCommentListParams = {
  page?: number
  limit?: number
}

export type TaskActivityPayload = {
  to: string
  from: string
  field: string
}


export type TaskActivity = {
  actorId: string
  createdAt: string
  id: string
  payload: TaskActivityPayload
  taskId: string
  type: TaskActivityType
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

export enum TaskActivityType {
  STATUS_CHANGED = 'STATUS_CHANGED',
  FIELD_UPDATED = 'FIELD_UPDATED',
  MEDIA_ADDED = 'MEDIA_ADDED',
  MEDIA_REMOVED = 'MEDIA_REMOVED',
}

export const TASK_ACTIVITY_LABELS: Record<TaskActivityType, string> = {
  [TaskActivityType.STATUS_CHANGED]: 'Изменен статус',
  [TaskActivityType.FIELD_UPDATED]: 'Изменено поле',
  [TaskActivityType.MEDIA_ADDED]: 'Загружено медиа',
  [TaskActivityType.MEDIA_REMOVED]: 'Удалено медиа',
} as const

export type UpdateTaskDto = {
  status?: TaskStatus
  media?: string[]
  description?: string
  finalDate?: string | null
  photoCount?: string
  videoCount?: string
  urgent?: boolean
}

export type CreateTaskCommentDto = {
  content: string
}

export type UpdateTaskCommentDto = {
  content: string
}


export type UploadMediaResponse = {
  url: string
  key: string
  mimeType: string
  size: number
}