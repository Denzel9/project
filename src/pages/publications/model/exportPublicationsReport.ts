import { format, isValid } from 'date-fns'

import { getPlatformLabel } from '@/entities/post'
import type { Publication } from '@/entities/publication'
import { downloadCsv } from '@/shared/lib/export'

import {
  getPublicationExecutorName,
  getPublicationPreviewMedia,
  getPublicationTitle,
} from './utils'

const formatExportDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)

  if (!isValid(date)) return '—'

  return format(date, 'dd.MM.yyyy HH:mm')
}

const buildExportFilename = () => {
  const date = format(new Date(), 'yyyy-MM-dd')

  return `publikacii_${date}.csv`
}

export const exportPublicationsReport = (publications: Publication[]) => {
  const headers = [
    'Название',
    'Площадка',
    'Исполнитель',
    'Создано',
    'Ссылка',
    'Медиа',
    'ID',
  ]

  const rows = publications.map(publication => {
    const previewMediaCount = getPublicationPreviewMedia(publication).length

    return [
      getPublicationTitle(publication),
      publication.platform ? getPlatformLabel(publication.platform) : '—',
      getPublicationExecutorName(publication) || '—',
      formatExportDateTime(publication.createdAt),
      publication.externalUrl || '—',
      previewMediaCount ? String(previewMediaCount) : '0',
      publication.id,
    ]
  })

  downloadCsv(buildExportFilename(), headers, rows)
}
