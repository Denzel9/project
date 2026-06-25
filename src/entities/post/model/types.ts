export type PostType = 'CREATOR' | 'COMPANY'

export type Platform =
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'TELEGRAM'
  | 'VK'
  | 'OTHER'

export enum PlatformEnum {
  INSTAGRAM = 'INSTAGRAM',
  TIKTOK = 'TIKTOK',
  YOUTUBE = 'YOUTUBE',
  TELEGRAM = 'TELEGRAM',
  VK = 'VK',
  OTHER = 'OTHER',
}

export type PlacementFormat =
  | 'POST'
  | 'STORIES'
  | 'REELS'
  | 'SHORTS'
  | 'INTEGRATION'
  | 'LIVE'

export enum PlacementFormatEnum {
  POST = 'POST',
  STORIES = 'STORIES',
  REELS = 'REELS',
  SHORTS = 'SHORTS',
  INTEGRATION = 'INTEGRATION',
  LIVE = 'LIVE',
}

export type WorkFormat = 'REMOTE' | 'ON_SITE' | 'HYBRID'

export enum WorkFormatEnum {
  REMOTE = 'REMOTE',
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID',
}

export type BudgetType = 'FIXED' | 'RANGE' | 'NEGOTIABLE' | 'BARTER'

export enum BudgetTypeEnum {
  FIXED = 'FIXED',
  RANGE = 'RANGE',
  NEGOTIABLE = 'NEGOTIABLE',
  BARTER = 'BARTER',
}

export type PaymentTerms = 'PREPAY' | 'POSTPAY' | '50_50' | 'SAFE_DEAL'

export enum PaymentTermsEnum {
  PREPAY = 'PREPAY',
  POSTPAY = 'POSTPAY',
  HALF = '50_50',
  SAFE_DEAL = 'SAFE_DEAL',
}

export type PostCurrency = 'RUB' | 'USD'

export type PostBudget = {
  type: BudgetType
  amount?: number
  currency?: PostCurrency
  minAmount?: number
  maxAmount?: number
  paymentTerms?: PaymentTerms
  barterDescription?: string
}

export type PostLocation = {
  city?: string
  country?: string
  address?: string
  shootingRequired?: boolean
}

// Значение	Смысл
// UNBOXING
// Распаковка продукта
// TUTORIAL
// Обучающий контент / how-to
// VLOG
// Влог, нативная интеграция в день блогера
// STORYTELLING
// Сторителлинг, сюжетная подача
// BEFORE_AFTER
// До/после (beauty, фитнес и т.п.)
// CHALLENGE
// Челлендж, вирусный формат
// GRWM
// Get Ready With Me
// HAUL
// Покупки / хaul
// PODCAST
// Подкаст, длинный разговорный формат
// INTERVIEW
// Интервью, Q&A
// ASMR
// ASMR-контент
// EDUCATIONAL
// Образовательный контент

export type ContentStyle =
  | 'LIFESTYLE'
  | 'REVIEW'
  | 'HUMOR'
  | 'EXPERT'
  | 'UGC'
  | 'UNBOXING'
  | 'TUTORIAL'
  | 'VLOG'
  | 'STORYTELLING'
  | 'BEFORE_AFTER'
  | 'CHALLENGE'
  | 'BUYING'
  | 'PODCAST'
  | 'INTERVIEW'
  | 'ASMR'
  | 'EDUCATIONAL'
  | 'SPORTS'

export enum ContentStyleEnum {
  LIFESTYLE = 'LIFESTYLE',
  REVIEW = 'REVIEW',
  HUMOR = 'HUMOR',
  EXPERT = 'EXPERT',
  UGC = 'UGC',
  UNBOXING = 'UNBOXING',
  TUTORIAL = 'TUTORIAL',
  VLOG = 'VLOG',
  STORYTELLING = 'STORYTELLING',
  BEFORE_AFTER = 'BEFORE_AFTER',
  CHALLENGE = 'CHALLENGE',
  BUYING = 'BUYING',
  SPORTS = 'SPORTS',
  PODCAST = 'PODCAST',
  INTERVIEW = 'INTERVIEW',
  ASMR = 'ASMR',
  EDUCATIONAL = 'EDUCATIONAL',
}

export type BloggerRequirements = {
  minFollowers?: number
  maxFollowers?: number
  minEngagementRate?: number
  verifiedAccount?: boolean
  experienceWithAds?: boolean
  languages?: string[]
  contentStyle?: ContentStyle[]
}

export type UsageRights = 'ORGANIC_ONLY' | 'PAID_ADS' | 'FULL_LICENSE'

export enum UsageRightsEnum {
  ORGANIC_ONLY = 'ORGANIC_ONLY',
  PAID_ADS = 'PAID_ADS',
  FULL_LICENSE = 'FULL_LICENSE',
}

export type CooperationDetails = {
  exclusivity?: boolean
  exclusivityDays?: number
  usageRights?: UsageRights
  usageDurationDays?: number
  requiresMarking?: boolean
  requiresContract?: boolean
  ndaRequired?: boolean
}

export type PostBrief = {
  taskDescription?: string
  references?: string[]
  brandGuidelinesUrl?: string
  hashtags?: string[]
  mentions?: string[]
  cta?: string
  dosAndDonts?: string
}

export type PostDeliverable = {
  platform: Platform
  format: PlacementFormat
  count: number
  durationSec?: number
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

export type PostOwner = {
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

export type Post = {
  id: string
  title: string
  type: PostType
  chips: string[]
  urgent: boolean
  owner: PostOwner
  createdAt: string
  updatedAt: string
  media: PostMedia[]
  description: string
  isPrivate?: boolean
  isArchived: boolean
  categories: string[]
  permissions: string[]
  keyWords?: string[]
  platforms?: Platform[]
  placementFormats?: PlacementFormat[]
  niche?: string[]
  budget?: PostBudget
  deadline?: string
  workFormat?: WorkFormat
  location?: PostLocation
  bloggerRequirements?: BloggerRequirements
  cooperationDetails?: CooperationDetails
  brief?: PostBrief
  tags?: string[]
  deliverables?: PostDeliverable[]
}

export type CreatePostDto = {
  title: string
  permissions?: string[]
  chips?: string[]
  urgent?: boolean
  description?: string
  keyWords?: string[]
  categories?: string[]
  isPrivate?: boolean
  platforms?: Platform[]
  placementFormats?: PlacementFormat[]
  niche?: string[]
  budget?: PostBudget
  deadline?: string
  workFormat?: WorkFormat
  location?: PostLocation
  bloggerRequirements?: BloggerRequirements
  cooperationDetails?: CooperationDetails
  brief?: PostBrief
  tags?: string[]
  deliverables?: PostDeliverable[]
}

export type UpdatePostDto = Partial<CreatePostDto> & {
  isArchived?: boolean
  isPrivate?: boolean
}

export type PostListParams = {
  ownerId?: string
  type?: PostType
  isArchived?: boolean
  isPrivate?: boolean
  page?: number
  limit?: number
  q?: string
  platforms?: Platform[]
  placementFormats?: PlacementFormat[]
  niche?: string[]
  workFormat?: WorkFormat
  budgetType?: BudgetType
  deadlineFrom?: string
  deadlineTo?: string
  tags?: string[]
}

export type SearchPostsParams = {
  q: string
  page?: number
  limit?: number
}

export type CreatePostTaskDto = {
  postId: string
  executorId: string
}

export type PostTasksParams = {
  postId: string
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
