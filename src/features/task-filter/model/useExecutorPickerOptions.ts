import { useMemo } from 'react'

import {
  getFavoriteUserName,
  isFavoriteUserItem,
  useConversationsQuery,
  useFavoritesQuery,
} from '@/entities'

export type ExecutorPickerOption = {
  id: string
  label: string
}

export const EXECUTOR_UNASSIGNED_ID = 'unassigned'

export const useExecutorPickerOptions = (enabled: boolean) => {
  const { data: conversations, isLoading: isConversationsLoading } =
    useConversationsQuery(undefined, { enabled })

  const { data: favoriteCreators, isLoading: isCreatorsLoading } =
    useFavoritesQuery(
      { type: 'CREATOR', page: 1, limit: 100 },
      { enabled },
    )

  const { data: favoriteCompanies, isLoading: isCompaniesLoading } =
    useFavoritesQuery(
      { type: 'COMPANY', page: 1, limit: 100 },
      { enabled },
    )

  const options = useMemo(() => {
    const uniqueById = new Map<string, ExecutorPickerOption>()

    for (const conversation of conversations ?? []) {
      if (conversation.isNotes) continue

      const { peer } = conversation
      if (!peer?.id || uniqueById.has(peer.id)) continue

      uniqueById.set(peer.id, {
        id: peer.id,
        label: peer.displayName || 'Пользователь',
      })
    }

    const favoriteItems = [
      ...(favoriteCreators?.items ?? []),
      ...(favoriteCompanies?.items ?? []),
    ]

    for (const item of favoriteItems) {
      if (!isFavoriteUserItem(item) || uniqueById.has(item.userId)) continue

      uniqueById.set(item.userId, {
        id: item.userId,
        label: getFavoriteUserName(item.user),
      })
    }

    return [...uniqueById.values()].sort((a, b) =>
      a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' }),
    )
  }, [conversations, favoriteCreators, favoriteCompanies])

  const optionsWithUnassigned = useMemo(
    () => [
      { id: EXECUTOR_UNASSIGNED_ID, label: 'Не назначен' },
      ...options,
    ],
    [options],
  )

  return {
    options: optionsWithUnassigned,
    isLoading:
      isConversationsLoading || isCreatorsLoading || isCompaniesLoading,
  }
}
