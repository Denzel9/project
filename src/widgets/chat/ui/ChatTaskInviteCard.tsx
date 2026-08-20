import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import axios from 'axios'
import { useState } from 'react'

import { useTaskByIdQuery, useUpdateTaskMutation } from '@/entities/task'
import { ConfirmDialog } from '@/widgets/confirm-dialog'
import { useSnackbarStore } from '@/widgets/snackbar'

type ChatTaskInviteCardProps = {
  taskId: string
  taskTitle: string | null
  currentUserId: string | null
  isOutgoing: boolean
  showActions?: boolean
}

const statusLabel = (approval: boolean | null) => {
  if (approval === true) return 'Принято'
  if (approval === false) return 'Отклонено'
  return 'Ожидание ответа'
}

export const ChatTaskInviteCard = ({
  taskId,
  taskTitle,
  currentUserId,
  isOutgoing,
  showActions = true,
}: ChatTaskInviteCardProps) => {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  const { setSnackbarOpen } = useSnackbarStore()
  const { data: task, isLoading } = useTaskByIdQuery(taskId, !showActions)
  const { mutateAsync: updateTask } = useUpdateTaskMutation()

  const isExecutor = Boolean(currentUserId && task?.executorId === currentUserId)
  const approval = task?.isExecutorApprove ?? null
  const showButtons =
    showActions && isExecutor && approval === null && !isLoading
  const isBusy = isAccepting || isRejecting
  const title =
    taskTitle?.trim() ||
    task?.title?.trim() ||
    task?.post?.title?.trim() ||
    null

  const handleAccept = async () => {
    setIsAccepting(true)

    try {
      await updateTask({
        id: taskId,
        body: { isExecutorApprove: true },
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbarOpen?.(true, String(error.response?.data?.message))
      }
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)

    try {
      await updateTask({
        id: taskId,
        body: { isExecutorApprove: false },
      })
      setIsRejectDialogOpen(false)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbarOpen?.(true, String(error.response?.data?.message))
      }
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <Stack direction="column" spacing={1.5} sx={{ pt: 0.25, width: '100%' }}>
      <Typography
        variant="body2"
        sx={{ lineHeight: 1.45, fontWeight: 600 }}
      >
        {title
          ? `Вас назначили исполнителем задачи «${title}»`
          : 'Вас назначили исполнителем задачи'}
      </Typography>

      {isLoading && (
        <CircularProgress
          size={18}
          sx={{ color: isOutgoing ? 'common.white' : 'primary.main' }}
        />
      )}

      {showButtons && (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={isBusy}
            onClick={() => setIsRejectDialogOpen(true)}
            sx={{
              borderColor: isOutgoing ? 'rgba(255, 255, 255, 0.5)' : undefined,
              color: isOutgoing ? 'common.white' : undefined,
            }}
          >
            Отклонить
          </Button>

          <Button
            size="small"
            variant="outlined"
            disabled={isBusy}
            onClick={() => void handleAccept()}
            startIcon={
              isAccepting ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            sx={{
              borderColor: isOutgoing ? 'common.white' : undefined,
              color: isOutgoing ? 'common.white' : undefined,
            }}
          >
            Принять
          </Button>
        </Stack>
      )}

      {!isLoading && !showButtons && showActions && (
        <Typography
          variant="caption"
          sx={{
            opacity: isOutgoing ? 0.85 : 0.7,
            color: isOutgoing ? 'common.white' : 'text.secondary',
          }}
        >
          {statusLabel(approval)}
        </Typography>
      )}

      <ConfirmDialog
        title="Отказаться от задачи"
        description="Вы уверены, что хотите отказаться от участия в задаче?"
        isOpen={isRejectDialogOpen}
        isPending={isRejecting}
        successLabel="Отклонить"
        onSuccess={() => void handleReject()}
        onClose={() => setIsRejectDialogOpen(false)}
      />
    </Stack>
  )
}
