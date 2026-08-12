import {
  CalendarMonthOutlined,
  Close,
  DownloadOutlined,
  PrintOutlined,
  Search,
  Tune,
} from '@mui/icons-material'
import {
  CircularProgress,
  Drawer,
  IconButton,
  Popover,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'

import { APPLICATION_STATUS_LABELS } from '@/entities'
import { FilterAutocomplete, useScroll } from '@/shared'
import { DateCalendarFilter } from '@/shared/ui/date-picker/DateCalendarFilter'

import { MyResponsesMobileFilter } from './MyResponsesMobileFilter'
import { MyResponsesViewModeToggle } from './MyResponsesViewModeToggle'

import type {
  MyResponseTableReportControls,
  MyResponseViewMode,
} from '../model/types'
import type { ApplicationStatusFilter, CompanyFilter } from '../model/utils'

type CompanyOption = {
  ownerId: string
  companyName: string
}

type MyResponsesFilterProps = {
  status: ApplicationStatusFilter
  companyId: CompanyFilter
  onStatusChange: (value: ApplicationStatusFilter) => void
  onCompanyChange: (value: CompanyFilter) => void
  updatedDate: string | null
  onUpdatedDateChange: (value: string | null) => void
  companyOptions: CompanyOption[]
  searchQuery: string
  isSearchOpen: boolean
  onSearchQueryChange: (value: string) => void
  onSearchOpenChange: (open: boolean) => void
  viewMode: MyResponseViewMode
  onViewModeChange: (value: MyResponseViewMode) => void
  tableReport?: MyResponseTableReportControls
}

const MyResponsesFilter = ({
  status,
  companyId,
  onStatusChange,
  onCompanyChange,
  updatedDate,
  onUpdatedDateChange,
  companyOptions,
  searchQuery,
  isSearchOpen,
  onSearchQueryChange,
  onSearchOpenChange,
  viewMode,
  onViewModeChange,
  tableReport,
}: MyResponsesFilterProps) => {
  const { isScrolled, ref } = useScroll(80)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const statusOptions = useMemo(
    () =>
      Object.entries(APPLICATION_STATUS_LABELS).map(([id, label]) => ({
        id,
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

  const handleDateChange = (date: Dayjs | null) => {
    onUpdatedDateChange(date ? date.format('YYYY-MM-DD') : null)
    setAnchorEl(null)
  }

  const handleClearDate = () => {
    onUpdatedDateChange(null)
    setAnchorEl(null)
  }

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      onSearchOpenChange(false)
      onSearchQueryChange('')
      return
    }

    onSearchOpenChange(true)
  }

  const hasMobileFilters = status !== 'all' || companyId !== 'all'

  return (
    <>
      <Stack
        ref={ref}
        direction="row"
        sx={{
          p: 2,
          mb: 1,
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '24px',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          justifyContent: 'space-between',
          borderTopLeftRadius: isScrolled ? '0' : '24px',
          borderTopRightRadius: isScrolled ? '0' : '24px',
          borderTopColor: isScrolled ? 'transparent' : 'divider',
          boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <Stack
          spacing={2}
          direction="row"
          sx={{
            width: { xs: 'auto', md: '50%' },
            minWidth: 0,
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <FilterAutocomplete
            size="small"
            label="Статус"
            value={status}
            options={statusOptions}
            onChange={value => onStatusChange(value as ApplicationStatusFilter)}
            sx={{ flex: 1 }}
          />

          <FilterAutocomplete
            size="small"
            label="Компания"
            value={companyId}
            options={companyAutocompleteOptions}
            onChange={onCompanyChange}
            sx={{ flex: 1 }}
          />

          <IconButton
            color={updatedDate ? 'primary' : 'default'}
            onClick={event => setAnchorEl(event.currentTarget)}
          >
            <CalendarMonthOutlined />
          </IconButton>
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
          <IconButton
            color={updatedDate ? 'primary' : 'default'}
            onClick={event => setAnchorEl(event.currentTarget)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <CalendarMonthOutlined />
          </IconButton>

          {isSearchOpen && (
            <TextField
              autoFocus
              label="Поиск"
              size="small"
              variant="outlined"
              value={searchQuery}
              onChange={event => onSearchQueryChange(event.target.value)}
              sx={{ width: { xs: 160, sm: 220, md: 300 } }}
            />
          )}

          <IconButton onClick={handleToggleSearch}>
            {isSearchOpen ? <Close /> : <Search />}
          </IconButton>

          {tableReport && (
            <>
              <Tooltip title="Печать">
                <IconButton
                  size="small"
                  disabled={tableReport.disabled || tableReport.isPrinting}
                  onClick={tableReport.onPrint}
                >
                  {tableReport.isPrinting ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  ) : (
                    <PrintOutlined fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Экспорт CSV">
                <IconButton
                  size="small"
                  disabled={tableReport.disabled || tableReport.isExporting}
                  onClick={tableReport.onExport}
                >
                  {tableReport.isExporting ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  ) : (
                    <DownloadOutlined fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </>
          )}

          <MyResponsesViewModeToggle
            viewMode={viewMode}
            onChange={onViewModeChange}
          />

          <IconButton
            onClick={() => setIsMobileFilterOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            color={
              isMobileFilterOpen || hasMobileFilters ? 'primary' : 'default'
            }
          >
            <Tune />
          </IconButton>
        </Stack>
      </Stack>

      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: '32px',
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <DateCalendarFilter
          value={updatedDate}
          onChange={handleDateChange}
          onClear={handleClearDate}
        />
      </Popover>

      <Drawer
        anchor="right"
        open={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            p: { xs: 2, sm: 3 },
            width: { xs: '100%', sm: '80%' },
          },
        }}
      >
        <MyResponsesMobileFilter
          open={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          status={status}
          companyId={companyId}
          onStatusChange={onStatusChange}
          onCompanyChange={onCompanyChange}
          companyOptions={companyOptions}
        />
      </Drawer>
    </>
  )
}

export default MyResponsesFilter
