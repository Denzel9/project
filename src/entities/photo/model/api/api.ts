import { useMutation } from '@tanstack/react-query'

import { uploadPostMedia, type UploadMediaResponse } from '@/entities/post'
import { uploadTaskMedia } from '@/entities/task'
import { mainAxios } from '@/shared/api'
import { prepareFileForUpload } from '@/shared/lib/media'

import type { PhotoUploadParams } from '../types/types'

export const useUploadFileMutation = () =>
  useMutation({
    mutationKey: ['uploadFile'],
    mutationFn: async ({ data, postId, taskId }: PhotoUploadParams) => {
      const file = data.get('file')

      if (!(file instanceof File)) {
        throw new Error('File is required')
      }

      if (postId) {
        return uploadPostMedia(postId, file)
      }

      if (taskId) {
        return uploadTaskMedia(taskId, file)
      }

      const prepared = await prepareFileForUpload(file)
      const formData = new FormData()
      formData.append('file', prepared)

      const { data: response } = await mainAxios.post<UploadMediaResponse>(
        '/media/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )

      return response
    },
  })
