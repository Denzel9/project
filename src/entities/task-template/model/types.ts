import type {
  BloggerRequirements,
  CooperationDetails,
  PostBrief,
  PostDeliverable,
  PostLocation,
} from '@/entities/post'

export type TaskTemplate = {
  id: string
  ownerId: string
  name: string
  title: string | null
  description: string
  photoCount: string
  videoCount: string
  urgent: boolean
  finalDate?: string | null
  location?: PostLocation | null
  bloggerRequirements?: BloggerRequirements | null
  cooperationDetails?: CooperationDetails | null
  brief?: PostBrief | null
  deliverables?: PostDeliverable[] | null
  createdAt: string
  updatedAt: string
}

export type CreateTaskTemplateDto = {
  name: string
  title?: string | null
  description?: string
  photoCount?: string
  videoCount?: string
  urgent?: boolean
  finalDate?: string | null
  location?: PostLocation | null
  bloggerRequirements?: BloggerRequirements | null
  cooperationDetails?: CooperationDetails | null
  brief?: PostBrief | null
  deliverables?: PostDeliverable[] | null
}

export type UpdateTaskTemplateDto = Partial<CreateTaskTemplateDto>

export type InstantiateTaskTemplateDto = {
  postId: string
  executorId?: string
}
