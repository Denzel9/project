import { Box, Stack, TableSortLabel } from '@mui/material'

import type { TaskSortField, TaskSortOrder } from '../model/types/types'
import type { ReactNode } from 'react'

type TaskTableHeaderWithFilterProps = {
  field: TaskSortField
  label: string
  sortField: TaskSortField
  sortOrder: TaskSortOrder
  forPrint?: boolean
  filter?: ReactNode
  onSort: (field: TaskSortField) => void
}

export const TaskTableHeaderWithFilter = ({
  field,
  label,
  sortField,
  sortOrder,
  forPrint = false,
  filter,
  onSort,
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
      <Box component="span">{label}</Box>
      {filter}
    </Stack>
  </TableSortLabel>
)
