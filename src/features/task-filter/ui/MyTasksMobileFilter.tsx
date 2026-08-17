import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Popover,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import { TASK_STATUS_LABELS, type TaskStatus } from '@/entities'
import {
  getPartnerName,
  mapPartnerUserToRow,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities/partner'
import { DateCalendarFilter, FilterAutocomplete, FilterStatusSelect } from '@/shared'

import { useMyTaskFilterStore } from '../model/store'

type MyTasksMobileFilterProps = {
  open: boolean
  onClose: () => void
  isCompany: boolean
  postOptions: { id: string; label: string }[]
  showStatus?: boolean
}

type Draft = {
  status: TaskStatus[]
  postId: string
  executorId: string
  updatedDate: string | null
  urgentOnly: boolean
}

export const MyTasksMobileFilter = ({
  open,
  onClose,
  isCompany,
  postOptions,
  showStatus = true,
}: MyTasksMobileFilterProps) => {
  const status = useMyTaskFilterStore(state => state.status)
  const postId = useMyTaskFilterStore(state => state.postId)
  const executorId = useMyTaskFilterStore(state => state.executorId)
  const updatedDate = useMyTaskFilterStore(state => state.updatedDate)
  const extraFilter = useMyTaskFilterStore(state => state.extraFilter)
  const setStatus = useMyTaskFilterStore(state => state.setStatus)
  const setPostId = useMyTaskFilterStore(state => state.setPostId)
  const setExecutorId = useMyTaskFilterStore(state => state.setExecutorId)
  const setUpdatedDate = useMyTaskFilterStore(state => state.setUpdatedDate)
  const setExtraFilter = useMyTaskFilterStore(state => state.setExtraFilter)

  const [draft, setDraft] = useState<Draft>({
    status,
    postId,
    executorId,
    updatedDate,
    urgentOnly: extraFilter === 'urgent',
  })
  const [dateAnchorEl, setDateAnchorEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      setDraft({
        status,
        postId,
        executorId,
        updatedDate,
        urgentOnly: extraFilter === 'urgent',
      })
    }, 0)
  }, [open, status, postId, executorId, updatedDate, extraFilter])

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

  const dateDisplayValue = draft.updatedDate
    ? format(dayjs(draft.updatedDate).toDate(), 'dd.MM.yyyy', { locale: ru })
    : ''

  const handleDateChange = (date: Dayjs | null) => {
    setDraft(prev => ({
      ...prev,
      updatedDate: date?.isValid() ? date.format('YYYY-MM-DD') : null,
    }))
    setDateAnchorEl(null)
  }

  const handleDateClear = () => {
    setDraft(prev => ({ ...prev, updatedDate: null }))
    setDateAnchorEl(null)
  }

  const handleApply = () => {
    if (showStatus) {
      setStatus(draft.status)
    }
    setPostId(draft.postId)
    setExecutorId(draft.executorId)
    setUpdatedDate(draft.updatedDate)
    setExtraFilter(draft.urgentOnly ? 'urgent' : null)
    onClose()
  }

  const handleReset = () => {
    setDraft({
      status: [],
      postId: 'all',
      executorId: 'all',
      updatedDate: null,
      urgentOnly: false,
    })
    if (showStatus) {
      setStatus([])
    }
    setPostId('all')
    setExecutorId('all')
    setUpdatedDate(null)
    setExtraFilter(null)
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
          {showStatus && (
            <FilterStatusSelect
              value={draft.status}
              options={Object.entries(TASK_STATUS_LABELS).map(
                ([value, label]) => ({
                  value: value as TaskStatus,
                  label,
                }),
              )}
              onChange={value =>
                setDraft(prev => ({
                  ...prev,
                  status: value,
                }))
              }
            />
          )}

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

          <Box>
            <TextField
              fullWidth
              label="Дата обновления"
              value={dateDisplayValue}
              onClick={event => setDateAnchorEl(event.currentTarget)}
              slotProps={{
                input: {
                  readOnly: true,
                  sx: { cursor: 'pointer' },
                  endAdornment: draft.updatedDate ? (
                    <IconButton
                      size="small"
                      aria-label="Сбросить дату"
                      onClick={event => {
                        event.stopPropagation()
                        handleDateClear()
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  ) : undefined,
                },
              }}
            />

            <Popover
              open={Boolean(dateAnchorEl)}
              anchorEl={dateAnchorEl}
              onClose={() => setDateAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              sx={{
                '& .MuiPopover-paper': {
                  borderRadius: '32px',
                },
              }}
            >
              <DateCalendarFilter
                value={draft.updatedDate}
                onChange={handleDateChange}
                onClear={handleDateClear}
              />
            </Popover>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={draft.urgentOnly}
                onChange={event =>
                  setDraft(prev => ({
                    ...prev,
                    urgentOnly: event.target.checked,
                  }))
                }
                color="error"
              />
            }
            label="Только срочные"
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
