import { useMutation } from '@tanstack/react-query'

import { uploadPostMedia, type UploadMediaResponse } from '@/entities/post'
import { mainAxios } from '@/shared/api'

import type { PhotoUploadParams } from '../types/types'

export const useUploadFileMutation = () =>
  useMutation({
    mutationKey: ['uploadFile'],
    mutationFn: async ({ data, id }: PhotoUploadParams) => {
      const file = data.get('file')

      if (!(file instanceof File)) {
        throw new Error('File is required')
      }

      if (id) {
        return uploadPostMedia(id, file)
      }

      const { data: response } = await mainAxios.post<UploadMediaResponse>(
        '/media/upload',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )

      return response
    },
  })
