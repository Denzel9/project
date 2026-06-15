export type ApplicationStatus =
  | 'NEW'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type ApplicationPostSummary = {
  id: string
  title: string
  type: 'CREATOR' | 'COMPANY'
  ownerId: string
}

export type ApplicationApplicant = {
  id: string
  role: 'CREATOR' | 'COMPANY'
  avatar: string | null
  name?: string
  lastName?: string
  companyName?: string
}

export type Application = {
  id: string
  postId: string
  message: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  post?: ApplicationPostSummary
  applicant?: ApplicationApplicant
}

export type ApplicationList = {
  items: Application[]
  total: number
  page: number
  limit: number
}

export type CreateApplicationDto = {
  postId: string
  message: string
}

export type UpdateApplicationStatusDto = {
  status: 'VIEWED' | 'ACCEPTED' | 'REJECTED'
}

export type ApplicationListParams = {
  postId?: string
  status?: ApplicationStatus
  type?: ApplicationPostSummary['type']
  page?: number
  limit?: number
  q?: string
}

export type SearchApplicationsParams = {
  q: string
  page?: number
  limit?: number
}
