export type MediaKind = 'image' | 'video'

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg|avi)(\?|$)/i

export const getMediaKind = (src: string, mimeType?: string): MediaKind => {
  if (mimeType?.startsWith('video/')) return 'video'
  if (mimeType?.startsWith('image/')) return 'image'

  return VIDEO_EXT.test(src) ? 'video' : 'image'
}
