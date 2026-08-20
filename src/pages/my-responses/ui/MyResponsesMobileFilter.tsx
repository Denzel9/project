import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import { DateCalendarFilter, FilterAutocomplete, FilterStatusSelect } from '@/shared'

import {
  DEFAULT_APPLICATION_STATUS_FILTER,
  MY_RESPONSE_STATUS_OPTIONS,
  type ApplicationStatusFilter,
  type CompanyFilter,
} from '../model/utils'

type CompanyOption = {
  ownerId: string
  companyName: string
}

type MyResponsesMobileFilterProps = {
  open: boolean
  onClose: () => void
  status: ApplicationStatusFilter
  companyId: CompanyFilter
  onStatusChange: (value: ApplicationStatusFilter) => void
  onCompanyChange: (value: CompanyFilter) => void
  companyOptions: CompanyOption[]
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onSearchOpenChange: (open: boolean) => void
  updatedDate: string | null
  onUpdatedDateChange: (value: string | null) => void
}

type Draft = {
  status: ApplicationStatusFilter
  companyId: CompanyFilter
  searchQuery: string
  updatedDate: string | null
}

export const MyResponsesMobileFilter = ({
  open,
  onClose,
  status,
  companyId,
  onStatusChange,
  onCompanyChange,
  companyOptions,
  searchQuery,
  onSearchQueryChange,
  onSearchOpenChange,
  updatedDate,
  onUpdatedDateChange,
}: MyResponsesMobileFilterProps) => {
  const [draft, setDraft] = useState<Draft>({
    status,
    companyId,
    searchQuery,
    updatedDate,
  })
  const [dateAnchorEl, setDateAnchorEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      setDraft({ status, companyId, searchQuery, updatedDate })
    }, 0)
  }, [open, status, companyId, searchQuery, updatedDate])

  const companyAutocompleteOptions = useMemo(
    () =>
      companyOptions.map(({ ownerId, companyName }) => ({
        id: ownerId,
        label: companyName,
      })),
    [companyOptions],
  )

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
    const nextQuery = draft.searchQuery.trim()

    onStatusChange(draft.status)
    onCompanyChange(draft.companyId)
    onUpdatedDateChange(draft.updatedDate)
    onSearchQueryChange(nextQuery)
    onSearchOpenChange(Boolean(nextQuery))
    onClose()
  }

  const handleReset = () => {
    const nextStatus = [...DEFAULT_APPLICATION_STATUS_FILTER]
    setDraft({
      status: nextStatus,
      companyId: 'all',
      searchQuery: '',
      updatedDate: null,
    })
    onStatusChange(nextStatus)
    onCompanyChange('all')
    onUpdatedDateChange(null)
    onSearchQueryChange('')
    onSearchOpenChange(false)
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
            fullWidth
            label="Поиск"
            value={draft.searchQuery}
            onChange={event =>
              setDraft(prev => ({
                ...prev,
                searchQuery: event.target.value,
              }))
            }
          />

          <FilterStatusSelect
            size="medium"
            value={draft.status}
            options={MY_RESPONSE_STATUS_OPTIONS}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                status: value,
              }))
            }
            sx={{ width: '100%' }}
          />

          <FilterAutocomplete
            label="Компания"
            value={draft.companyId}
            options={companyAutocompleteOptions}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                companyId: value,
              }))
            }
            sx={{ width: '100%' }}
          />

          <Box>
            <TextField
              fullWidth
              label="Дата"
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
