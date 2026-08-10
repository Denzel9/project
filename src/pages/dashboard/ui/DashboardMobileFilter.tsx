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

import { useMyPostOptionsQuery } from '@/entities'
import {
  getPartnerName,
  mapPartnerUserToRow,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities/partner'
import {
  useMyTaskFilterStore,
  type DashboardPeriod,
} from '@/features'
import { FilterAutocomplete } from '@/shared'

import { DASHBOARD_PERIOD_OPTIONS } from '../model/constants'

type DashboardMobileFilterProps = {
  open: boolean
  onClose: () => void
  isCompany: boolean
}

type Draft = {
  postId: string
  executorId: string
  period: DashboardPeriod
}

export const DashboardMobileFilter = ({
  open,
  onClose,
  isCompany,
}: DashboardMobileFilterProps) => {
  const postId = useMyTaskFilterStore(state => state.postId)
  const executorId = useMyTaskFilterStore(state => state.executorId)
  const period = useMyTaskFilterStore(state => state.period)
  const setPostId = useMyTaskFilterStore(state => state.setPostId)
  const setExecutorId = useMyTaskFilterStore(state => state.setExecutorId)
  const setPeriod = useMyTaskFilterStore(state => state.setPeriod)

  const [draft, setDraft] = useState<Draft>({
    postId,
    executorId,
    period,
  })

  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      setDraft({ postId, executorId, period })
    }, 0)
  }, [open, postId, executorId, period])

  const { data: postsData, isLoading: isPostsLoading } =
    useMyPostOptionsQuery()
  const { data: executorsData, isLoading: isExecutorsLoading } =
    usePartnerExecutorsQuery(
      { sort: 'name', limit: 100 },
      { enabled: open && isCompany },
    )
  const { data: customersData, isLoading: isCustomersLoading } =
    usePartnerCustomersQuery(
      { sort: 'name', limit: 100 },
      { enabled: open && !isCompany },
    )

  const postOptions = useMemo(
    () =>
      (postsData?.items ?? []).map(post => ({
        id: post.id,
        label: post.title?.trim() || 'Без названия',
      })),
    [postsData?.items],
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
    setPostId(draft.postId)
    setExecutorId(draft.executorId)
    setPeriod(draft.period)
    onClose()
  }

  const handleReset = () => {
    setDraft({
      postId: 'all',
      executorId: 'all',
      period: 'all',
    })
    setPostId('all')
    setExecutorId('all')
    setPeriod('all')
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
            loading={isPostsLoading}
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
            label={isCompany ? 'Исполнитель' : 'Заказчик'}
          />

          <TextField
            select
            fullWidth
            value={draft.period}
            label="Период"
            onChange={event =>
              setDraft(prev => ({
                ...prev,
                period: event.target.value as DashboardPeriod,
              }))
            }
          >
            {DASHBOARD_PERIOD_OPTIONS.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
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
