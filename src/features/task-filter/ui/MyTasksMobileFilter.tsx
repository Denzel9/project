import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { TASK_STATUS_LABELS } from '@/entities'
import {
  getPartnerName,
  mapPartnerUserToRow,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities/partner'
import { FilterAutocomplete } from '@/shared'

import { useMyTaskFilterStore } from '../model/store'

import type { TaskStatusFilter } from '../model/utils'

type MyTasksMobileFilterProps = {
  open: boolean
  onClose: () => void
  isCompany: boolean
  postOptions: { id: string; label: string }[]
}

type Draft = {
  status: TaskStatusFilter
  postId: string
  executorId: string
}

export const MyTasksMobileFilter = ({
  open,
  onClose,
  isCompany,
  postOptions,
}: MyTasksMobileFilterProps) => {
  const status = useMyTaskFilterStore(state => state.status)
  const postId = useMyTaskFilterStore(state => state.postId)
  const executorId = useMyTaskFilterStore(state => state.executorId)
  const setStatus = useMyTaskFilterStore(state => state.setStatus)
  const setPostId = useMyTaskFilterStore(state => state.setPostId)
  const setExecutorId = useMyTaskFilterStore(state => state.setExecutorId)

  const [draft, setDraft] = useState<Draft>({
    status,
    postId,
    executorId,
  })

  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      setDraft({ status, postId, executorId })
    }, 0)
  }, [open, status, postId, executorId])

  const { data: executorsData, isLoading: isExecutorsLoading } =
    usePartnerExecutorsQuery(
      { sort: 'name' },
      { enabled: open && isCompany },
    )
  const { data: customersData, isLoading: isCustomersLoading } =
    usePartnerCustomersQuery(
      { sort: 'name' },
      { enabled: open && !isCompany },
    )

  const partnerOptions = useMemo(() => {
    const items = isCompany
      ? (executorsData?.items ?? [])
      : (customersData?.items ?? [])

    return items.map(item => ({
      id: item.id,
      label: isCompany ? mapPartnerUserToRow(item).name : getPartnerName(item),
    }))
  }, [customersData?.items, executorsData?.items, isCompany])

  const isPartnersLoading = isCompany ? isExecutorsLoading : isCustomersLoading

  const handleApply = () => {
    setStatus(draft.status)
    setPostId(draft.postId)
    setExecutorId(draft.executorId)
    onClose()
  }

  const handleReset = () => {
    setDraft({
      status: 'all',
      postId: 'all',
      executorId: 'all',
    })
    setStatus('all')
    setPostId('all')
    setExecutorId('all')
    onClose()
  }

  return (
    <Stack
      direction="column"
      sx={{
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mb: 4,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Фильтры</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>

        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label="Статус"
            value={draft.status}
            onChange={event =>
              setDraft(prev => ({
                ...prev,
                status: event.target.value as TaskStatusFilter,
              }))
            }
          >
            <MenuItem value="all">Все</MenuItem>
            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
              <MenuItem
                key={value}
                value={value}
              >
                {label}
              </MenuItem>
            ))}
          </TextField>

          <FilterAutocomplete
            label="Пост"
            value={draft.postId}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                postId: value,
              }))
            }
            options={postOptions}
            sx={{ width: '100%' }}
          />

          <FilterAutocomplete
            value={draft.executorId}
            options={partnerOptions}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                executorId: value,
              }))
            }
            loading={isPartnersLoading}
            sx={{ width: '100%' }}
            label={isCompany ? 'Исполнитель' : 'Компания'}
          />
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 4 }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
        >
          Сбросить
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApply}
        >
          Применить
        </Button>
      </Stack>
    </Stack>
  )
}
