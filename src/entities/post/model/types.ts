export type PostType = 'CREATOR' | 'COMPANY'

export type PostContentType = 'PHOTO' | 'VIDEO' | 'PHOTO_VIDEO'

export enum PostContentTypeEnum {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  PHOTO_VIDEO = 'PHOTO_VIDEO',
}
export type PostCooperationType = 'ONE_TIME' | 'LONG_TIME'

export enum PostCooperationTypeEnum {
  ONE_TIME = 'ONE_TIME',
  LONG_TIME = 'LONG_TIME',
}

export type PostMedia = {
  id: string
  url: string
  key: string
  size: string
  mimeType: string
}

export type PostList = {
  items: Post[]
  total: number
  page: number
  limit: number
}

export type Post = {
  id: string
  permissions: string[]
  media: PostMedia[]
  title: string
  ownerId: string
  chips: string[]
  description: string
  typeCooperation: PostCooperationType[]
  urgent: boolean
  contentType: PostContentType
  photoCount: string
  videoCount: string
  finalPrice: string
  rangePrice: string[]
  isArchived: boolean
  keyWords: string[]
  categories: string[]
  type: PostType
  createdAt: string
  updatedAt: string
}

export type CreatePostDto = {
  title: string
  chips?: string[]
  description?: string
  typeCooperation: PostCooperationType[]
  urgent?: boolean
  contentType: PostContentType
  photoCount?: string
  videoCount?: string
  finalPrice?: string
  rangePrice?: string[]
  keyWords?: string[]
  categories?: string[]
}

export type UpdatePostDto = Partial<
  Omit<CreatePostDto, 'typeCooperation' | 'contentType'>
> & {
  typeCooperation?: PostCooperationType[]
  contentType?: PostContentType
  isArchived?: boolean
}

export type PostListParams = {
  ownerId?: string
  type?: PostType
  isArchived?: boolean
  page?: number
  limit?: number
  q?: string
}

export type SearchPostsParams = {
  q: string
  page?: number
  limit?: number
}

export type UploadMediaResponse = {
  url: string
  key: string
  mimeType: string
  size: number
}

export enum POST_TYPE_ENUM {
  ALL = 'ALL',
  CREATOR = 'CREATOR',
  COMPANY = 'COMPANY',
}

export enum POST_STATUS_ENUM {
  NEW = 'NEW',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export const POST_STATUS_LABELS: Record<POST_STATUS_ENUM, string> = {
  NEW: 'Новый',
  VIEWED: 'Просмотрен',
  ACCEPTED: 'Принят',
  REJECTED: 'Отклонён',
  WITHDRAWN: 'Отозван',
}
