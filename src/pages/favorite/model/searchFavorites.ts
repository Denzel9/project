import type { FavoritePostItem } from '@/entities/favorite';

import type { FavoriteGroupFilter } from './utils';

const UNGROUPED_LABEL = 'Без подборки';

const isInCurrentGroup = (
  favorite: FavoritePostItem,
  groupFilter: FavoriteGroupFilter,
): boolean => {
  if (groupFilter === 'all') {
    return true;
  }

  if (groupFilter === 'ungrouped') {
    return favorite.groupId === null;
  }

  return favorite.groupId === groupFilter;
};

export const partitionFavoriteSearchResults = (
  favorites: FavoritePostItem[],
  groupFilter: FavoriteGroupFilter,
): {
  inCurrentGroup: FavoritePostItem[];
  otherGroups: { groupLabel: string; items: FavoritePostItem[] }[];
} => {
  if (groupFilter === 'all') {
    return { inCurrentGroup: favorites, otherGroups: [] };
  }

  const inCurrentGroup = favorites.filter(favorite =>
    isInCurrentGroup(favorite, groupFilter),
  );

  const otherMatches = favorites.filter(
    favorite => !isInCurrentGroup(favorite, groupFilter),
  );

  const groupsMap = new Map<string, FavoritePostItem[]>();

  for (const favorite of otherMatches) {
    const groupLabel = favorite.groupName ?? UNGROUPED_LABEL;
    const items = groupsMap.get(groupLabel) ?? [];
    items.push(favorite);
    groupsMap.set(groupLabel, items);
  }

  const otherGroups = Array.from(groupsMap.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'ru'))
    .map(([groupLabel, items]) => ({ groupLabel, items }));

  return { inCurrentGroup, otherGroups };
};
