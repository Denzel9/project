import type { FavoriteListParams } from '@/entities/favorite';

export type FavoriteGroupFilter = 'all' | 'ungrouped' | string;

export const toFavoriteListParams = (
  filter: FavoriteGroupFilter,
  pagination?: { page?: number; limit?: number },
): FavoriteListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filter === 'ungrouped' && { ungrouped: true }),
  ...(filter !== 'all' && filter !== 'ungrouped' && { groupId: filter }),
});
