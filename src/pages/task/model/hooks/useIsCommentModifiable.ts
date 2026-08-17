import { useEffect, useState } from 'react'

import {
  canEditTaskComment,
  COMMENT_MODIFY_WINDOW_MS,
  type TaskComment,
} from '@/entities/task'

export const useIsCommentModifiable = (
  comment: Pick<TaskComment, 'authorId' | 'createdAt'>,
  userId: string | null,
) => {
  const [canModify, setCanModify] = useState(() =>
    canEditTaskComment(comment, { userId }),
  )

  useEffect(() => {
    const context = { userId }

    const update = () => {
      setCanModify(canEditTaskComment(comment, context))
    }

    update()

    const elapsed = Date.now() - new Date(comment.createdAt).getTime()
    const remaining = COMMENT_MODIFY_WINDOW_MS - elapsed

    if (remaining <= 0) {
      return
    }

    const timerId = window.setTimeout(update, remaining)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [comment.authorId, comment.createdAt, userId])

  return canModify
}
