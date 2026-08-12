import { Box, Stack, TableSortLabel } from '@mui/material'

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
    sx={forPrint ? { pointerEvents: 'none' } : undefined}
  >
    <Stack
      direction="row"
      spacing={0.25}
      sx={{ alignItems: 'center', minWidth: 0, mr: 0.25 }}
    >
      <Box component="span" color={isActive ? 'primary.main' : 'text.primary'}>{label}</Box>
      {filter}
    </Stack>
  </TableSortLabel>
)
