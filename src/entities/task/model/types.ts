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

export type Task = {
  id: string
  applicationId: string
  postId: string
  ownerId: string
  executorId: string
  status: TaskStatus
  media: string[]
  description: string
  finalDate: string | null
  photoCount: string
  videoCount: string
  urgent: boolean
  createdAt: string
  updatedAt: string
  comments?: TaskComment[]
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