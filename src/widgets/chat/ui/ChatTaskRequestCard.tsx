import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import axios from 'axios'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo, useState } from 'react'

import {
  TASK_REQUEST_INITIATOR_LABELS,
  useConfirmTaskAnnulmentMutation,
  useConfirmTaskDeadlineExtensionMutation,
  useRejectTaskAnnulmentMutation,
  useRejectTaskDeadlineExtensionMutation,
  useTaskByIdQuery,
  type Task,
  type TaskAnnulment,
  type TaskDeadlineExtension,
} from '@/entities/task'
import { useSnackbarStore } from '@/widgets/snackbar'

type ChatTaskRequestKind = 'annulment' | 'deadline'

type ChatTaskRequestCardProps = {
  kind: ChatTaskRequestKind
  taskId: string
  requestId: string | null
  taskTitle: string | null
  reason: string | null
  proposedDate: string | null
  currentUserId: string | null
  isOutgoing: boolean
  showActions?: boolean
}

const REQUEST_STATUS_LABEL = {
  PENDING: 'Ожидание ответа',
  CONFIRMED: 'Подтверждено',
  REJECTED: 'Отклонено',
} as const

const findRequest = <T extends { id: string }>(
  requestId: string | null,
  pending: T | null | undefined,
  items: T[] | undefined,
): T | null => {
  if (requestId) {
    return (
      items?.find(item => item.id === requestId) ??
      (pending?.id === requestId ? pending : null) ??
      null
    )
  }

  return pending ?? items?.[0] ?? null
}

const getAnnulmentRequest = (
  task: Task | undefined,
  requestId: string | null,
): TaskAnnulment | null =>
  findRequest(requestId, task?.annulment, task?.annulments)

const getDeadlineRequest = (
  task: Task | undefined,
  requestId: string | null,
): TaskDeadlineExtension | null =>
  findRequest(requestId, task?.deadlineExtension, task?.deadlineExtensions)

const formatProposedDate = (value: string | null | undefined) => {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return format(date, 'dd.MM.yyyy', { locale: ru })
}

export const ChatTaskRequestCard = ({
  kind,
  taskId,
  requestId,
  taskTitle,
  reason,
  proposedDate,
  currentUserId,
  isOutgoing,
  showActions = true,
}: ChatTaskRequestCardProps) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const { setSnackbarOpen } = useSnackbarStore()
  const { data: task, isLoading } = useTaskByIdQuery(taskId, !showActions)
  const { mutateAsync: confirmAnnulment } = useConfirmTaskAnnulmentMutation()
  const { mutateAsync: rejectAnnulment } = useRejectTaskAnnulmentMutation()
  const { mutateAsync: confirmDeadline } =
    useConfirmTaskDeadlineExtensionMutation()
  const { mutateAsync: rejectDeadline } =
    useRejectTaskDeadlineExtensionMutation()

  const request = useMemo(() => {
    if (kind === 'annulment') {
      return getAnnulmentRequest(task, requestId)
    }

    return getDeadlineRequest(task, requestId)
  }, [kind, requestId, task])

  const title =
    taskTitle?.trim() ||
    task?.title?.trim() ||
    task?.post?.title?.trim() ||
    null
  const heading = title
    ? kind === 'annulment'
      ? `Запрос на аннулирование задачи «${title}»`
      : `Запрос на перенос дедлайна задачи «${title}»`
    : kind === 'annulment'
      ? 'Запрос на аннулирование задачи'
      : 'Запрос на перенос дедлайна'

  const liveReason = request?.reason?.trim() || reason?.trim() || null
  const liveProposedDate =
    kind === 'deadline'
      ? formatProposedDate(
          getDeadlineRequest(task, requestId)?.proposedFinalDate ?? proposedDate,
        ) || proposedDate
      : null
  const initiatorLabel = request
    ? TASK_REQUEST_INITIATOR_LABELS[request.initiator]
    : null

  const canRespond = Boolean(
    showActions &&
      request?.status === 'PENDING' &&
      currentUserId &&
      request.requestedById !== currentUserId &&
      (task?.ownerId === currentUserId || task?.executorId === currentUserId),
  )
  const isBusy = isConfirming || isRejecting
  const statusLabel = request ? REQUEST_STATUS_LABEL[request.status] : null

  const handleConfirm = async () => {
    if (isBusy) return

    setIsConfirming(true)

    try {
      if (kind === 'annulment') {
        await confirmAnnulment(taskId)
        setSnackbarOpen?.(true, 'Задача аннулирована')
      } else {
        await confirmDeadline(taskId)
        setSnackbarOpen?.(true, 'Дедлайн перенесён')
      }
    } catch (error) {
      setSnackbarOpen?.(
        true,
        axios.isAxiosError(error)
          ? String(error.response?.data?.message ?? 'Не удалось подтвердить запрос')
          : 'Не удалось подтвердить запрос',
        'error',
      )
    } finally {
      setIsConfirming(false)
    }
  }

  const handleReject = async () => {
    if (isBusy) return

    setIsRejecting(true)

    try {
      if (kind === 'annulment') {
        await rejectAnnulment(taskId)
        setSnackbarOpen?.(true, 'Запрос на аннулирование отклонён')
      } else {
        await rejectDeadline(taskId)
        setSnackbarOpen?.(true, 'Запрос на перенос дедлайна отклонён')
      }
    } catch (error) {
      setSnackbarOpen?.(
        true,
        axios.isAxiosError(error)
          ? String(error.response?.data?.message ?? 'Не удалось отклонить запрос')
          : 'Не удалось отклонить запрос',
        'error',
      )
    } finally {
      setIsRejecting(false)
    }
  }

  const captionColor = {
    opacity: isOutgoing ? 0.85 : 0.7,
    color: isOutgoing ? 'common.white' : 'text.secondary',
  }

  return (
    <Stack direction="column" spacing={1} sx={{ pt: 0.25, width: '100%' }}>
      <Typography
        variant="body2"
        sx={{ lineHeight: 1.45, fontWeight: 600 }}
      >
        {heading}
      </Typography>

      {initiatorLabel && (
        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
          Инициатор: {initiatorLabel}
        </Typography>
      )}

      {liveProposedDate && (
        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
          Новая дата: {liveProposedDate}
        </Typography>
      )}

      {liveReason && (
        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
          Причина: {liveReason}
        </Typography>
      )}

      {isLoading && (
        <CircularProgress
          size={18}
          sx={{ color: isOutgoing ? 'common.white' : 'primary.main' }}
        />
      )}

      {canRespond && (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={isBusy}
            onClick={() => void handleReject()}
            startIcon={
              isRejecting ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
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
            onClick={() => void handleConfirm()}
            startIcon={
              isConfirming ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            sx={{
              borderColor: isOutgoing ? 'common.white' : undefined,
              color: isOutgoing ? 'common.white' : undefined,
            }}
          >
            Подтвердить
          </Button>
        </Stack>
      )}

      {!isLoading && !canRespond && showActions && statusLabel && (
        <Typography variant="caption" sx={captionColor}>
          {statusLabel}
        </Typography>
      )}
    </Stack>
  )
}
