import { TableSortLabel } from '@mui/material'

import { filteredColumnLabelSx } from '../model/styles'

import type { TaskSortField, TaskSortOrder } from '../model/types/types'
import type { ReactNode } from 'react'

type TaskTableHeaderWithFilterProps = {
  label: string
  isActive?: boolean
  forPrint?: boolean
  filter?: ReactNode
  field: TaskSortField
  sortField: TaskSortField
  sortOrder: TaskSortOrder
  onSort: (field: TaskSortField) => void
}

export const TaskTableHeaderWithFilter = ({
  field,
  label,
  filter,
  onSort,
  sortField,
  sortOrder,
  forPrint = false,
  isActive = false,
}: TaskTableHeaderWithFilterProps) => (
  <TableSortLabel
    active={sortField === field}
    direction={sortField === field ? sortOrder : 'asc'}
    onClick={() => onSort(field)}
    hideSortIcon={forPrint}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      ...(forPrint && { pointerEvents: 'none' }),
      ...(isActive && filteredColumnLabelSx),
    }}
  >
    {label}
    {filter}
  </TableSortLabel>
)
