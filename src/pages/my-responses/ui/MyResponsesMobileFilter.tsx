import { Close } from '@mui/icons-material'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from '@/entities'
import { FilterAutocomplete, FilterStatusSelect } from '@/shared'

import {
  DEFAULT_APPLICATION_STATUS_FILTER,
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
}

type Draft = {
  status: ApplicationStatusFilter
  companyId: CompanyFilter
}

export const MyResponsesMobileFilter = ({
  open,
  onClose,
  status,
  companyId,
  onStatusChange,
  onCompanyChange,
  companyOptions,
}: MyResponsesMobileFilterProps) => {
  const [draft, setDraft] = useState<Draft>({ status, companyId })

  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      setDraft({ status, companyId })
    }, 0)
  }, [open, status, companyId])

  const statusOptions = useMemo(
    () =>
      Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({
        value: value as ApplicationStatus,
        label,
      })),
    [],
  )

  const companyAutocompleteOptions = useMemo(
    () =>
      companyOptions.map(({ ownerId, companyName }) => ({
        id: ownerId,
        label: companyName,
      })),
    [companyOptions],
  )

  const handleApply = () => {
    onStatusChange(draft.status)
    onCompanyChange(draft.companyId)
    onClose()
  }

  const handleReset = () => {
    const nextStatus = [...DEFAULT_APPLICATION_STATUS_FILTER]
    setDraft({ status: nextStatus, companyId: 'all' })
    onStatusChange(nextStatus)
    onCompanyChange('all')
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
          <FilterStatusSelect
            value={draft.status}
            options={statusOptions}
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
