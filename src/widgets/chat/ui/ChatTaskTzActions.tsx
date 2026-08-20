import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import axios from 'axios'
import { useMemo, useState } from 'react'

import {
  canTransitionTaskStatus,
  getIsCompanyAction,
  isTaskExecutor,
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  useTaskByIdQuery,
  useUpdateTaskMutation,
  type TaskStatus,
} from '@/entities/task'
import { useAuthStore } from '@/features/auth'
import { useSnackbarStore } from '@/widgets/snackbar'

type ChatTaskTzActionsProps = {
  taskId: string
  currentUserId: string | null
  isOutgoing: boolean
}

export const ChatTaskTzActions = ({
  taskId,
  currentUserId,
  isOutgoing,
}: ChatTaskTzActionsProps) => {
  const isPrime = useAuthStore(state => state.isPrime)
  const { setSnackbarOpen } = useSnackbarStore()
  const { data: task, isLoading } = useTaskByIdQuery(taskId, isPrime)
  const { mutateAsync: updateTask } = useUpdateTaskMutation()
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null)

  const isExecutor = isTaskExecutor(task ?? { executorId: null }, currentUserId)
  const canTakeInProgress = Boolean(
    task &&
      isExecutor &&
      canTransitionTaskStatus(task, currentUserId, TASK_STATUS_ENUM.IN_PROGRESS),
  )
  const canSendToRevision = Boolean(
    task &&
      isExecutor &&
      canTransitionTaskStatus(task, currentUserId, TASK_STATUS_ENUM.REVISION),
  )
  const showButtons = !isPrime && isExecutor && (canTakeInProgress || canSendToRevision)
  const isBusy = pendingStatus !== null

  const statusCaption = useMemo(() => {
    if (!task) return null
    return TASK_STATUS_LABELS[task.status] ?? null
  }, [task])

  if (isPrime || isLoading || !task || !isExecutor) {
    return null
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (isBusy) return

    setPendingStatus(newStatus)

    try {
      await updateTask({
        id: taskId,
        body: {
          status: newStatus,
          isCompanyAction: getIsCompanyAction(task, false, newStatus),
        },
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbarOpen?.(true, String(error.response?.data?.message))
      }
    } finally {
      setPendingStatus(null)
    }
  }

  const buttonSx = {
    borderColor: isOutgoing ? 'common.white' : undefined,
    color: isOutgoing ? 'common.white' : undefined,
  }

  if (showButtons) {
    return (
      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
        {canSendToRevision && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={isBusy}
            onClick={() => void handleStatusChange(TASK_STATUS_ENUM.REVISION)}
            startIcon={
              pendingStatus === TASK_STATUS_ENUM.REVISION ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            sx={{
              borderColor: isOutgoing ? 'rgba(255, 255, 255, 0.5)' : undefined,
              color: isOutgoing ? 'common.white' : undefined,
            }}
          >
            На доработку
          </Button>
        )}

        {canTakeInProgress && (
          <Button
            size="small"
            variant="outlined"
            disabled={isBusy}
            onClick={() => void handleStatusChange(TASK_STATUS_ENUM.IN_PROGRESS)}
            startIcon={
              pendingStatus === TASK_STATUS_ENUM.IN_PROGRESS ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            sx={buttonSx}
          >
            В работу
          </Button>
        )}
      </Stack>
    )
  }

  if (!statusCaption) {
    return null
  }

  return (
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        mt: 1.5,
        opacity: isOutgoing ? 0.85 : 0.7,
        color: isOutgoing ? 'common.white' : 'text.secondary',
      }}
    >
      {statusCaption}
    </Typography>
  )
}
