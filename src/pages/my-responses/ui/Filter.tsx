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

import { FilterAutocomplete, FilterStatusSelect, safeAreaFullWidthDrawerPaperSx, useScroll } from '@/shared'
import { DateCalendarFilter } from '@/shared/ui/date-picker/DateCalendarFilter'

import {
  isDefaultApplicationStatusFilter,
  MY_RESPONSE_STATUS_OPTIONS,
  type ApplicationStatusFilter,
  type CompanyFilter,
} from '../model/utils'

import { MyResponsesMobileFilter } from './MyResponsesMobileFilter'
import { MyResponsesViewModeToggle } from './MyResponsesViewModeToggle'

import type {
  MyResponseTableReportControls,
  MyResponseViewMode,
} from '../model/types'

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

  const hasMobileFilters =
    !isDefaultApplicationStatusFilter(status) ||
    companyId !== 'all' ||
    Boolean(updatedDate) ||
    Boolean(searchQuery.trim())

  return (
    <>
      <Stack
        ref={ref}
        direction="row"
        sx={{
          p: 2,
          mb: 1,
          bgcolor: 'background.paper',
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
          spacing={1}
          direction="row"
          sx={{
            width: { xs: 'auto', md: '50%' },
            minWidth: 0,
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <FilterStatusSelect
            size="small"
            value={status}
            options={MY_RESPONSE_STATUS_OPTIONS}
            onChange={onStatusChange}
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
          {isSearchOpen && (
            <TextField
              autoFocus
              label="Поиск"
              size="small"
              variant="outlined"
              value={searchQuery}
              onChange={event => onSearchQueryChange(event.target.value)}
              sx={{
                width: { sm: 220, md: 300 },
                display: { xs: 'none', md: 'block' },
              }}
            />
          )}

          <IconButton
            onClick={handleToggleSearch}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
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
            width: { xs: '100%', sm: '80%' },
            ...safeAreaFullWidthDrawerPaperSx(),
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
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          onSearchOpenChange={onSearchOpenChange}
          updatedDate={updatedDate}
          onUpdatedDateChange={onUpdatedDateChange}
        />
      </Drawer>
    </>
  )
}

export default MyResponsesFilter
