import {
  getFavoriteUserName,
  type FavoritePostItem,
  type FavoriteUserItem,
  type FavoriteListParams,
  type FavoriteType,
} from '@/entities/favorite';
import { getUserName, type User } from '@/entities/user';

import type {
  FavoritePostSortField,
  FavoriteSortOrder,
  FavoriteUserSortField,
} from './types';

export type FavoriteGroupFilter = 'all' | 'ungrouped' | string;

export const toFavoriteListParams = (
  filter: FavoriteGroupFilter,
  options?: {
    type?: FavoriteType;
    q?: string;
    pagination?: { page?: number; limit?: number };
  },
): FavoriteListParams => ({
  type: options?.type ?? 'POST',
  page: options?.pagination?.page ?? 1,
  limit: options?.pagination?.limit ?? 20,
  ...(options?.q && { q: options.q }),
  ...(filter === 'ungrouped' && { ungrouped: true }),
  ...(filter !== 'all' && filter !== 'ungrouped' && { groupId: filter }),
});

export const toFavoriteInfiniteListParams = (
  filter: FavoriteGroupFilter,
  options?: {
    type?: FavoriteType;
    q?: string;
    limit?: number;
  },
): Omit<FavoriteListParams, 'page'> => ({
  type: options?.type ?? 'POST',
  limit: options?.limit ?? 20,
  ...(options?.q && { q: options.q }),
  ...(options?.type === 'POST' && filter === 'ungrouped' && { ungrouped: true }),
  ...(options?.type === 'POST' &&
    filter !== 'all' &&
    filter !== 'ungrouped' && { groupId: filter }),
});

const compareStrings = (a: string, b: string) => a.localeCompare(b, 'ru');

export const sortFavoritePosts = (
  items: FavoritePostItem[],
  field: FavoritePostSortField,
  order: FavoriteSortOrder,
) => {
  const direction = order === 'asc' ? 1 : -1;

  return [...items].sort((left, right) => {
    // eslint-disable-next-line no-useless-assignment
    let result = 0;

    switch (field) {
      case 'title':
        result = compareStrings(
          left.post.title.toLowerCase(),
          right.post.title.toLowerCase(),
        );
        break;
      case 'owner':
        result = compareStrings(
          getUserName(left.post.owner as Partial<User>)?.toLowerCase() ?? '',
          getUserName(right.post.owner as Partial<User>)?.toLowerCase() ?? '',
        );
        break;
      case 'group':
        result = compareStrings(
          (left.groupName ?? '').toLowerCase(),
          (right.groupName ?? '').toLowerCase(),
        );
        break;
      case 'savedAt':
        result =
          new Date(left.savedAt).getTime() - new Date(right.savedAt).getTime();
        break;
      default:
        result = 0;
    }

    return result * direction;
  });
};

export const sortFavoriteUsers = (
  items: FavoriteUserItem[],
  field: FavoriteUserSortField,
  order: FavoriteSortOrder,
) => {
  const direction = order === 'asc' ? 1 : -1;

  return [...items].sort((left, right) => {
    // eslint-disable-next-line no-useless-assignment
    let result = 0;

    switch (field) {
      case 'name':
        result = compareStrings(
          getFavoriteUserName(left.user).toLowerCase(),
          getFavoriteUserName(right.user).toLowerCase(),
        );
        break;
      case 'location':
        result = compareStrings(
          (left.user.location ?? '').toLowerCase(),
          (right.user.location ?? '').toLowerCase(),
        );
        break;
      case 'followers':
        result = (left.user.followers ?? 0) - (right.user.followers ?? 0);
        break;
      case 'completedTasksCount':
        result =
          (left.user.completedTasksCount ?? 0) -
          (right.user.completedTasksCount ?? 0);
        break;
      case 'savedAt':
        result =
          new Date(left.savedAt).getTime() - new Date(right.savedAt).getTime();
        break;
      default:
        result = 0;
    }

    return result * direction;
  });
};
