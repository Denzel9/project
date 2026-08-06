import { useEffect, useState } from 'react'

import {
  isMessageDeletable,
  MESSAGE_DELETE_WINDOW_MS,
} from '@/entities/chat'

export const useIsMessageDeletable = (
  createdAt: string,
  senderId: string,
  currentUserId: string | null | undefined,
) => {
  const [canDelete, setCanDelete] = useState(() =>
    isMessageDeletable(createdAt, senderId, currentUserId),
  )

  useEffect(() => {
    const update = () => {
      setCanDelete(isMessageDeletable(createdAt, senderId, currentUserId))
    }

    update()

    const elapsed = Date.now() - new Date(createdAt).getTime()
    const remaining = MESSAGE_DELETE_WINDOW_MS - elapsed

    if (remaining <= 0) {
      return
    }

    const timerId = window.setTimeout(update, remaining)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [createdAt, currentUserId, senderId])

  return canDelete
}
