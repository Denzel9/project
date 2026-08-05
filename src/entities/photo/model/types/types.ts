import type { PostMedia, UploadMediaResponse } from '@/entities/post'

export type PhotoUploadParams = {
  data: FormData
  folder?: string
  postId?: string
  taskId?: string
}

export type PhotoUploadResponse = UploadMediaResponse

export type MediaUploadStatus =
  | 'preparing'
  | 'ready'
  | 'uploading'
  | 'error'

export type Photo = Omit<PostMedia, 'id'> & {
  id?: string
  filename?: string
  lastModified?: string
  /** Stable client id for pending uploads (not server key). */
  localId?: string
  uploadStatus?: MediaUploadStatus
  /** 0–100 while uploading */
  uploadProgress?: number
  uploadError?: string
}

export type GetPhotoUploadResponse = {
  files: Photo[]
}

export type GetPhotoUploadParams = { id: string; folder: string }

export type GetMultipleFilesResponse = {
  files: Photo[]
}[]

export type GetMultipleFilesParams = { ids: string[]; folder: string }
