import type {
  Platform,
  PostBrief,
  PostDeliverable,
  PostLocation, Owner, Executor
} from '@/entities'

export type PublicationRole = 'owner' | 'executor'

export type PublicationMedia = {
  id: string
  sourceTaskMediaId?: string | null
  url: string
  key: string
  size: string
  mimeType: string
}

export type Publication = {
  id: string
  taskId: string
  postId: string
  post?: {
    id: string
    title: string | null
  } | null
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
  media: PublicationMedia[]
  owner: Owner
  executor?: Executor | null
}

export type PublicationList = {
  items: Publication[]
  total: number
  page: number
  limit: number
}

export type PublicationListParams = {
  role?: PublicationRole
  postId?: string
  taskId?: string
  executorId?: string
  q?: string
  executorQ?: string
  page?: number
  limit?: number
}
