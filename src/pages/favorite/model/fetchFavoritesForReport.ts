import {
  fetchAllFavorites,
  isFavoritePostItem,
  isFavoriteUserItem,
  type FavoriteListItem,
  type FavoriteType,
} from '@/entities/favorite'

import { toFavoriteListParams, type FavoriteGroupFilter } from './utils'

export type FavoritesReportOptions = {
  favoriteType: FavoriteType
  groupFilter: FavoriteGroupFilter
  q?: string
}

export const fetchFavoritesForReport = async (
  options: FavoritesReportOptions,
): Promise<FavoriteListItem[]> => {
  const params = toFavoriteListParams(options.groupFilter, {
    type: options.favoriteType,
    q: options.q,
  })

  const { page: _page, limit: _limit, ...filters } = params

  const items = await fetchAllFavorites(filters)

  if (options.favoriteType === 'POST') {
    return items.filter(isFavoritePostItem)
  }

  return items.filter(isFavoriteUserItem)
}
