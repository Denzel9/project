import { format, isValid } from 'date-fns'

import {
  getFavoriteUserName,
  isFavoritePostItem,
  isFavoriteUserItem,
  type FavoriteListItem,
  type FavoriteType,
} from '@/entities/favorite'
import { getUserName, type User } from '@/entities/user'
import { downloadCsv } from '@/shared/lib/export'

const formatExportDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)

  if (!isValid(date)) return '—'

  return format(date, 'dd.MM.yyyy HH:mm')
}

const buildExportFilename = (favoriteType: FavoriteType) => {
  const date = format(new Date(), 'yyyy-MM-dd')
  const suffix =
    favoriteType === 'POST'
      ? 'posty'
      : favoriteType === 'CREATOR'
        ? 'kreatory'
        : 'kompanii'

  return `izbrannoe_${suffix}_${date}.csv`
}

export const exportFavoritesReport = (
  items: FavoriteListItem[],
  favoriteType: FavoriteType,
) => {
  if (favoriteType === 'POST') {
    const posts = items.filter(isFavoritePostItem)
    const headers = [
      'Название',
      'Владелец',
      'Подборка',
      'Добавлено',
      'Срочное',
      'ID поста',
    ]

    const rows = posts.map(item => [
      item.post.title,
      getUserName(item.post.owner as Partial<User>) || '—',
      item.groupName || 'Без подборки',
      formatExportDateTime(item.savedAt),
      item.post.urgent ? 'Да' : 'Нет',
      item.postId,
    ])

    downloadCsv(buildExportFilename(favoriteType), headers, rows)
    return
  }

  const users = items.filter(isFavoriteUserItem)
  const headers = [
    'Имя',
    'Роль',
    'Локация',
    'В избранном у',
    'Выполненные работы',
    'Добавлено',
    'ID',
  ]

  const rows = users.map(item => [
    getFavoriteUserName(item.user),
    item.user.role === 'COMPANY' ? 'Компания' : 'Исполнитель',
    item.user.location || '—',
    String(item.user.followers ?? 0),
    String(item.user.completedTasksCount ?? 0),
    formatExportDateTime(item.savedAt),
    item.userId,
  ])

  downloadCsv(buildExportFilename(favoriteType), headers, rows)
}
