import { format, isValid } from 'date-fns'

import {
  APPLICATION_STATUS_LABELS,
  type Application,
} from '@/entities/application'
import { getUserName, type User } from '@/entities/user'
import { downloadCsv } from '@/shared/lib/export'

const formatExportDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)

  if (!isValid(date)) return '—'

  return format(date, 'dd.MM.yyyy HH:mm')
}

const buildExportFilename = () => {
  const date = format(new Date(), 'yyyy-MM-dd')

  return `moi_otkliki_${date}.csv`
}

export const exportMyResponsesReport = (applications: Application[]) => {
  const headers = [
    'Объявление',
    'Компания',
    'Статус',
    'Сообщение',
    'Отправлен',
    'Обновлён',
    'ID',
  ]

  const rows = applications.map(application => [
    application.post?.title ?? '—',
    getUserName(application.post?.owner as Partial<User> | undefined) || '—',
    APPLICATION_STATUS_LABELS[application.status],
    application.message || '—',
    formatExportDateTime(application.createdAt),
    formatExportDateTime(application.updatedAt),
    application.id,
  ])

  downloadCsv(buildExportFilename(), headers, rows)
}
