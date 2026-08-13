import type { TaskMedia } from "@/entities/task"

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
  owner: {
    id: string
    creatorProfile: {
      name: string
      lastName: string
    }
    companyProfile: {
      companyName: string
    }
  }
  media?: TaskMedia[]

}

export type ApplicationApplicant = {
  id: string
  role: 'CREATOR' | 'COMPANY'
  avatar: string | null
  name?: string
  lastName?: string
  companyName?: string
}

export type ApplicantStatistics = {
  completedWorks: number
  cancelledWorks: number
  totalPublications: number
  sharedInProgressWorks: number
  sharedCompletedWorks: number
  sharedPublications: number
  favoritedByCount: number
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
  applicantStatistics?: ApplicantStatistics | null
  createdActorAccountId?: string | null
  createdActorDisplayName?: string | null
  createdActorKind?: 'OWNER' | 'MANAGER' | null
  lastActorAccountId?: string | null
  lastActorDisplayName?: string | null
  lastActorKind?: 'OWNER' | 'MANAGER' | null
}

export type ApplicationList = {
  items: Application[]
  total: number
  page: number
  limit: number
}

export type ApplicationStats = {
  incomingNew: number
  mineActive: number
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
  userId?: string
  status?: ApplicationStatus
  type?: ApplicationPostSummary['type']
  createdDate?: string
  page?: number
  limit?: number
  q?: string
}

export type SearchApplicationsParams = {
  q: string
  page?: number
  limit?: number
}
