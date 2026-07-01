import type { Post } from '@/entities/post'

export type FavoriteType = 'POST' | 'CREATOR' | 'COMPANY'

export type FavoriteGroup = {
  id: string
  name: string
  count: number
  createdAt: string
  updatedAt: string
}

export type FavoritePostItem = {
  type: 'POST'
  postId: string
  groupId: string | null
  groupName: string | null
  savedAt: string
  post: Post
}

export type FavoriteUserProfile = {
  id: string
  role: 'CREATOR' | 'COMPANY'
  avatar: string | null
  bio: string | null
  followers: number
  location: string | null
  aboutMe: string | null
  banner: string | null
  name?: string
  lastName?: string
  companyName?: string
}

export type FavoriteUserItem = {
  type: 'CREATOR' | 'COMPANY'
  userId: string
  savedAt: string
  user: FavoriteUserProfile
}

export type FavoriteListItem = FavoritePostItem | FavoriteUserItem

/** @deprecated use FavoritePostItem */
export type Favorite = FavoritePostItem

export type FavoriteList = {
  items: FavoriteListItem[]
  total: number
  page: number
  limit: number
}

export type AddFavoritePostDto = {
  postId: string
  groupId?: string
}

export type AddFavoriteUserDto = {
  userId: string
}

export type AddFavoriteDto = AddFavoritePostDto | AddFavoriteUserDto

export type CreateFavoriteGroupDto = {
  name: string
}

export type FavoriteListParams = {
  type?: FavoriteType
  groupId?: string
  ungrouped?: boolean
  page?: number
  limit?: number
  q?: string
}

export type SearchFavoritesParams = {
  q: string
  type?: FavoriteType
  groupId?: string
  ungrouped?: boolean
  page?: number
  limit?: number
}

export const isFavoritePostItem = (
  item: FavoriteListItem,
): item is FavoritePostItem => item.type === 'POST' || 'postId' in item

export const isFavoriteUserItem = (
  item: FavoriteListItem,
): item is FavoriteUserItem => item.type === 'CREATOR' || item.type === 'COMPANY'

export const getFavoriteUserName = (user: FavoriteUserProfile) => {
  if (user.role === 'COMPANY') {
    return user.companyName ?? 'Компания'
  }

  return [user.name, user.lastName].filter(Boolean).join(' ') || 'Креатор'
}
