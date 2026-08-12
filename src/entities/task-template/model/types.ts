export type TaskTemplate = {
  id: string
  ownerId: string
  name: string
  title: string | null
  description: string
  photoCount: string
  videoCount: string
  urgent: boolean
  brief: unknown | null
  deliverables: unknown | null
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
  brief?: unknown | null
  deliverables?: unknown | null
}

export type UpdateTaskTemplateDto = Partial<CreateTaskTemplateDto>

export type InstantiateTaskTemplateDto = {
  postId: string
  executorId?: string
}
