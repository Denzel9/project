import { useMutation, useQueryClient } from '@tanstack/react-query'

import { chatKeys } from '@/entities/chat'
import { postKeys } from '@/entities/post'
import {
  taskKeys,
} from '@/entities/task'
import { mainAxios } from '@/shared/api'

import type { DeleteMediaParams } from './types'

export const deleteMedia = async ({
  mediaId,
  postId,
  taskId,
  conversationId,
}: DeleteMediaParams) => {
  await mainAxios.delete(`/media/${mediaId}`, {
    params: { postId, taskId, conversationId },
  })
}

export const useDeleteMediaMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: (_, { postId, taskId, conversationId }) => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
        queryClient.invalidateQueries({ queryKey: postKeys.all })
      }

      if (taskId) {
        // if (mediaId) {
        //   removeTaskMediaFromCache(queryClient, taskId, mediaId)
        // }

        void queryClient.invalidateQueries({
          queryKey: taskKeys.detail(taskId),
        })

        const cachedTask = queryClient.getQueryData<{ postId?: string }>(
          taskKeys.detail(taskId),
        )

        if (cachedTask?.postId) {
          void queryClient.invalidateQueries({
            queryKey: [...postKeys.all, 'postTasks', cachedTask.postId],
          })
        }

        void queryClient.invalidateQueries({ queryKey: taskKeys.all })
        void queryClient.invalidateQueries({
          queryKey: [...taskKeys.all, 'activities', taskId],
        })
      }

      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: [...chatKeys.all, 'messages', conversationId],
        })
        queryClient.invalidateQueries({
          queryKey: [...chatKeys.all, 'attachments', conversationId],
        })
      }
    },
  })
}
