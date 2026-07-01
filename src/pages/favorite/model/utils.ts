import type { FavoriteListParams, FavoriteType } from '@/entities/favorite';

export type FavoriteGroupFilter = 'all' | 'ungrouped' | string;

export const toFavoriteListParams = (
  filter: FavoriteGroupFilter,
  options?: {
    type?: FavoriteType;
    pagination?: { page?: number; limit?: number };
  },
): FavoriteListParams => ({
  type: options?.type ?? 'POST',
  page: options?.pagination?.page ?? 1,
  limit: options?.pagination?.limit ?? 20,
  ...(filter === 'ungrouped' && { ungrouped: true }),
  ...(filter !== 'all' && filter !== 'ungrouped' && { groupId: filter }),
});

export const toFavoriteInfiniteListParams = (
  filter: FavoriteGroupFilter,
  options?: {
    type?: FavoriteType;
    limit?: number;
  },
): Omit<FavoriteListParams, 'page'> => ({
  type: options?.type ?? 'POST',
  limit: options?.limit ?? 20,
  ...(options?.type === 'POST' && filter === 'ungrouped' && { ungrouped: true }),
  ...(options?.type === 'POST' &&
    filter !== 'all' &&
    filter !== 'ungrouped' && { groupId: filter }),
});
