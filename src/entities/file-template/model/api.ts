import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'

import type { FileTemplate } from './types'
import type { UploadMediaResponse } from '@/entities/post'

export const fileTemplateKeys = {
  all: ['file-templates'] as const,
  list: () => [...fileTemplateKeys.all, 'list'] as const,
}

export const useFileTemplatesQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: fileTemplateKeys.list(),
    queryFn: async () => {
      const { data } = await mainAxios.get<FileTemplate[]>('/file-templates')
      return data
    },
    enabled: options?.enabled ?? true,
  })

export const useCreateFileTemplateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', file.name)

      const { data } = await mainAxios.post<FileTemplate>(
        '/file-templates',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )

      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fileTemplateKeys.all })
    },
  })
}

export const useDeleteFileTemplateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await mainAxios.delete(`/file-templates/${id}`)
      return id
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fileTemplateKeys.all })
    },
  })
}

export type SendFileTemplateTarget =
  | { conversationId: string }
  | { taskId: string }

export const sendFileTemplate = async (
  id: string,
  target: SendFileTemplateTarget,
): Promise<UploadMediaResponse> => {
  const { data } = await mainAxios.post<UploadMediaResponse>(
    `/file-templates/${id}/send`,
    target,
  )

  return data
}
