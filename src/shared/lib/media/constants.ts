export const MEDIA_IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const MEDIA_VIDEO_MAX_BYTES = 100 * 1024 * 1024
export const MEDIA_DOCUMENT_MAX_BYTES = 25 * 1024 * 1024

export const MAX_TASK_REPORT_FILES = 30
export const TASK_REPORT_ARCHIVE_HINT =
  'Можно загрузить не больше 30 файлов. Если материалов больше — упакуйте их в ZIP-архив и загрузите одним файлом.'

export const MEDIA_UPLOAD_CONCURRENCY = 3
export const MEDIA_PREPARE_CONCURRENCY = 2

export const MEDIA_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif'

export const MEDIA_VIDEO_ACCEPT =
  'video/mp4,video/webm,video/quicktime'

export const MEDIA_POST_ACCEPT = `${MEDIA_IMAGE_ACCEPT},${MEDIA_VIDEO_ACCEPT}`

export const MEDIA_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
  'text/csv',
  'application/csv',
  'text/comma-separated-values',
] as const

export const MEDIA_DOCUMENT_ACCEPT = [
  ...MEDIA_DOCUMENT_MIME_TYPES,
  '.pdf',
  '.xls',
  '.xlsx',
  '.csv',
  '.doc',
  '.docx',
  '.zip',
].join(',')

export const MEDIA_FILE_TEMPLATE_ACCEPT = `${MEDIA_POST_ACCEPT},${MEDIA_DOCUMENT_ACCEPT}`
