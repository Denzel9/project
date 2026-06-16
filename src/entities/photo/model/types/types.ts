import type { PostMedia, UploadMediaResponse } from '@/entities/post'

export type PhotoUploadParams = {
  data: FormData
  folder?: string
  postId?: string
  taskId?: string
}

export type PhotoUploadResponse = UploadMediaResponse

export type Photo = PostMedia & {
  filename?: string
  lastModified?: string
}

export type GetPhotoUploadResponse = {
  files: Photo[]
}

export type GetPhotoUploadParams = { id: string; folder: string }

export type GetMultipleFilesResponse = {
  files: Photo[]
}[]

export type GetMultipleFilesParams = { ids: string[]; folder: string }
