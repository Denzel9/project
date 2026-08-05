import { format, isValid } from 'date-fns'

import {
  APPLICATION_STATUS_LABELS,
  type Application,
} from '@/entities/application'
import { getPartnerName } from '@/entities/partner'
import { downloadCsv } from '@/shared/lib/export'

const formatExportDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)

  if (!isValid(date)) return '—'

  return format(date, 'dd.MM.yyyy HH:mm')
}

const buildExportFilename = () => {
  const date = format(new Date(), 'yyyy-MM-dd')

  return `vkhodyashchie_otkliki_${date}.csv`
}

export const exportIncomingApplicationsReport = (
  applications: Application[],
) => {
  const headers = [
    'Кандидат',
    'Объявление',
    'Статус',
    'Сообщение',
    'Создан',
    'Обновлён',
    'ID',
  ]

  const rows = applications.map(application => [
    getPartnerName(application.applicant),
    application.post?.title ?? '—',
    APPLICATION_STATUS_LABELS[application.status],
    application.message || '—',
    formatExportDateTime(application.createdAt),
    formatExportDateTime(application.updatedAt),
    application.id,
  ])

  downloadCsv(buildExportFilename(), headers, rows)
}
