export const MEDIA_IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const MEDIA_VIDEO_MAX_BYTES = 100 * 1024 * 1024
export const MEDIA_DOCUMENT_MAX_BYTES = 25 * 1024 * 1024

export const MEDIA_UPLOAD_CONCURRENCY = 3
export const MEDIA_PREPARE_CONCURRENCY = 2

export const MEDIA_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif'

export const MEDIA_VIDEO_ACCEPT =
  'video/mp4,video/webm,video/quicktime'

export const MEDIA_POST_ACCEPT = `${MEDIA_IMAGE_ACCEPT},${MEDIA_VIDEO_ACCEPT}`
