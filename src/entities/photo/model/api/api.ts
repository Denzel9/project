import { useMutation } from '@tanstack/react-query'

import { uploadPostMedia, type UploadMediaResponse } from '@/entities/post'
import { mainAxios } from '@/shared/api'

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
        return uploadPostMedia(taskId, file)
      }

      const { data: response } = await mainAxios.post<UploadMediaResponse>(
        '/media/upload',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )

      return response
    },
  })
