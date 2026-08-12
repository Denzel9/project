import { useCallback, useMemo, useState } from 'react'

import { type TaskStatus } from '@/entities'

import { type TaskTableColumnFilters } from '../types/types'

type ControlledField<T> = {
  value: T
  onChange: (value: T) => void
}

type UseTaskTableColumnFiltersOptions = {
  isCompany: boolean
  status?: ControlledField<TaskStatus | 'all'>
  personId?: ControlledField<string>
  urgentOnly?: ControlledField<boolean>
  updatedDate?: ControlledField<string | null>
}

export const useTaskTableColumnFilters = ({
  isCompany,
  status: statusControl,
  personId: personIdControl,
  urgentOnly: urgentOnlyControl,
  updatedDate: updatedDateControl,
}: UseTaskTableColumnFiltersOptions) => {
  const [localStatus, setLocalStatus] = useState<TaskStatus | 'all'>('all')
  const [taskId, setTaskId] = useState('all')
  const [taskQuery, setTaskQuery] = useState('')
  const [localPersonId, setLocalPersonId] = useState('all')
  const [manager, setManager] = useState<string | 'all'>('all')
  const [localUrgentOnly, setLocalUrgentOnly] = useState(false)
  const [localUpdatedDate, setLocalUpdatedDate] = useState<string | null>(null)
  const [deadlineDate, setDeadlineDate] = useState<string | null>(null)

  const status = statusControl?.value ?? localStatus
  const onStatusChange = statusControl?.onChange ?? setLocalStatus

  const personId = personIdControl?.value ?? localPersonId
  const onPersonIdChange = personIdControl?.onChange ?? setLocalPersonId

  const urgentOnly = urgentOnlyControl?.value ?? localUrgentOnly
  const onUrgentOnlyChange = urgentOnlyControl?.onChange ?? setLocalUrgentOnly

  const updatedDate = updatedDateControl?.value ?? localUpdatedDate
  const onUpdatedDateChange = updatedDateControl?.onChange ?? setLocalUpdatedDate

  const handleTaskIdChange = useCallback((value: string) => {
    setTaskId(value)
    if (value !== 'all') {
      setTaskQuery('')
    }
  }, [])

  const resetFilters = useCallback(() => {
    onStatusChange('all')
    setTaskId('all')
    setTaskQuery('')
    onPersonIdChange('all')
    setManager('all')
    onUrgentOnlyChange(false)
    onUpdatedDateChange(null)
    setDeadlineDate(null)
  }, [
    onStatusChange,
    onPersonIdChange,
    onUrgentOnlyChange,
    onUpdatedDateChange,
  ])

  const hasActiveFilters =
    status !== 'all' ||
    taskId !== 'all' ||
    Boolean(taskQuery.trim()) ||
    personId !== 'all' ||
    manager !== 'all' ||
    urgentOnly ||
    updatedDate !== null ||
    deadlineDate !== null

  const columnFilters = useMemo<TaskTableColumnFilters>(
    () => ({
      status,
      manager,
      taskId,
      taskQuery,
      personId,
      urgentOnly,
      updatedDate,
      deadlineDate,
      personLabel: isCompany ? 'Исполнитель' : 'Заказчик',
      onStatusChange,
      onTaskIdChange: handleTaskIdChange,
      onTaskQueryChange: setTaskQuery,
      onPersonIdChange,
      onUrgentOnlyChange,
      onUpdatedDateChange,
      onDeadlineDateChange: setDeadlineDate,
    }),
    [
      status,
      manager,
      taskId,
      taskQuery,
      personId,
      urgentOnly,
      updatedDate,
      deadlineDate,
      isCompany,
      onStatusChange,
      handleTaskIdChange,
      onPersonIdChange,
      onUrgentOnlyChange,
      onUpdatedDateChange,
    ],
  )

  return {
    columnFilters,
    hasActiveFilters,
    resetFilters,
    status,
    taskId,
    taskQuery,
    personId,
    urgentOnly,
    updatedDate,
    deadlineDate,
  }
}
