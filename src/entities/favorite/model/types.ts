import type { Post } from '@/entities/post'

export type FavoriteGroup = {
  id: string
  name: string
  count: number
  createdAt: string
  updatedAt: string
}

export type Favorite = {
  postId: string
  groupId: string | null
  groupName: string | null
  savedAt: string
  post: Post
}

export type FavoriteList = {
  items: Favorite[]
  total: number
  page: number
  limit: number
}

export type AddFavoriteDto = {
  postId: string
  groupId?: string
}

export type CreateFavoriteGroupDto = {
  name: string
}

export type FavoriteListParams = {
  groupId?: string
  ungrouped?: boolean
  page?: number
  limit?: number
  q?: string
}

export type SearchFavoritesParams = {
  q: string
  groupId?: string
  ungrouped?: boolean
  page?: number
  limit?: number
}
