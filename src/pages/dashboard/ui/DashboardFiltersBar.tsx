import { Tune } from '@mui/icons-material'
import { Chip, Drawer, IconButton, MenuItem, Stack, TextField } from '@mui/material'
import { useMemo, useState } from 'react'

import { useMyPostOptionsQuery } from '@/entities'
import {
  getPartnerName,
  mapPartnerUserToRow,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities/partner'
import {
  AssigneeFilterMenu,
  useIsManagerAccount,
  useMyTaskFilterStore,
  type DashboardPeriod,
} from '@/features'
import { FilterAutocomplete, safeAreaFullWidthDrawerPaperSx } from '@/shared'

import { DASHBOARD_PERIOD_OPTIONS } from '../model/constants'

import { DashboardMobileFilter } from './DashboardMobileFilter'

type DashboardFiltersBarProps = {
  isCompany: boolean
}

export const DashboardFiltersBar = ({
  isCompany,
}: DashboardFiltersBarProps) => {
  const isManagerAccount = useIsManagerAccount()
  const postId = useMyTaskFilterStore(state => state.postId)
  const executorId = useMyTaskFilterStore(state => state.executorId)
  const period = useMyTaskFilterStore(state => state.period)
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId,
  )
  const setPostId = useMyTaskFilterStore(state => state.setPostId)
  const setExecutorId = useMyTaskFilterStore(state => state.setExecutorId)
  const setPeriod = useMyTaskFilterStore(state => state.setPeriod)
  const setOnlyMyTasks = useMyTaskFilterStore(state => state.setOnlyMyTasks)
  const setAssigneeAccountId = useMyTaskFilterStore(
    state => state.setAssigneeAccountId,
  )

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const { data: postsData, isLoading: isPostsLoading } =
    useMyPostOptionsQuery()
  const { data: executorsData, isLoading: isExecutorsLoading } =
    usePartnerExecutorsQuery(
      { sort: 'name', limit: 100 },
      { enabled: isCompany },
    )
  const { data: customersData, isLoading: isCustomersLoading } =
    usePartnerCustomersQuery(
      { sort: 'name', limit: 100 },
      { enabled: !isCompany },
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

  const hasAssigneeFilter = isManagerAccount
    ? false
    : assigneeAccountId !== 'all'

  const hasActiveFilters =
    postId !== 'all' ||
    executorId !== 'all' ||
    period !== 'all' ||
    hasAssigneeFilter

  const hasMobileDrawerFilters =
    postId !== 'all' || executorId !== 'all' || period !== 'all'

  const handleReset = () => {
    setPostId('all')
    setExecutorId('all')
    setPeriod('all')
    if (!isManagerAccount) {
      setOnlyMyTasks(false)
    }
    setAssigneeAccountId('all')
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={1.5}
        useFlexGap
        sx={{
          mb: 1,
          p: 2,
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: { xs: 'none', md: 'flex' },
            minWidth: 0,
            flex: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <FilterAutocomplete
            label="Пост"
            value={postId}
            onChange={setPostId}
            options={postOptions}
            loading={isPostsLoading}
            sx={{ width: { sm: 220 } }}
            size="small"
          />

          <FilterAutocomplete
            value={executorId}
            options={partnerOptions}
            onChange={setExecutorId}
            loading={isPartnersLoading}
            sx={{ width: { sm: 220 } }}
            label={isCompany ? 'Исполнитель' : 'Заказчик'}
            size="small"
          />

          <TextField
            select
            size="small"
            value={period}
            label="Период"
            sx={{ width: { sm: 180 } }}
            onChange={event => setPeriod(event.target.value as DashboardPeriod)}
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

          {hasActiveFilters && (
            <Chip
              label="Сбросить"
              variant="outlined"
              onClick={handleReset}
              sx={{ flexShrink: 0 }}
            />
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            flexShrink: 0,
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'flex-end', md: 'flex-start' },
          }}
        >
          <FilterAutocomplete
            label="Пост"
            value={postId}
            onChange={setPostId}
            options={postOptions}
            loading={isPostsLoading}
            size="small"
            sx={{
              flex: 1,
              minWidth: 0,
              display: { xs: 'flex', md: 'none' },
            }}
          />

          <AssigneeFilterMenu isCompany={isCompany} />

          <IconButton
            onClick={() => setIsMobileFilterOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            color={
              isMobileFilterOpen || hasMobileDrawerFilters
                ? 'primary'
                : 'default'
            }
          >
            <Tune />
          </IconButton>
        </Stack>
      </Stack>

      <Drawer
        anchor="right"
        open={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '80%' },
            ...safeAreaFullWidthDrawerPaperSx(),
          },
        }}
      >
        <DashboardMobileFilter
          open={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          isCompany={isCompany}
        />
      </Drawer>
    </>
  )
}
