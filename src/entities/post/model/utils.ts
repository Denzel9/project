import type { Photo } from '@/entities/photo'

import type { PostMedia } from './types'

export const mapPostMediaToPhotos = (media: PostMedia[]): Photo[] =>
  media.map(item => ({
    id: item.id,
    url: item.url,
    key: item.key,
    mimeType: item.mimeType,
    size: item.size,
  }))
