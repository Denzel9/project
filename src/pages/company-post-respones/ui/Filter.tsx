import {
  CalendarMonthOutlined,
  DownloadOutlined,
  PrintOutlined,
  Tune,
} from '@mui/icons-material'
import {
  CircularProgress,
  Drawer,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'

import {
  APPLICATION_STATUS_LABELS,
  getPartnerName,
  mapPartnerUserToRow,
  normalizePartnerUser,
  usePartnerApplicantsQuery,
} from '@/entities'
import { FilterAutocomplete, useScroll } from '@/shared'
import { DateCalendarFilter } from '@/shared/ui/date-picker/DateCalendarFilter'

import { useMyPostFilterStore } from '../model/store'

import { MyPostViewModeToggle } from './MyPostViewModeToggle'
import { PostsResponsesMobileFilter } from './PostsResponsesMobileFilter'

import type { ApplicationTableReportControls } from '../model/types'
import type { ApplicationStatusFilter } from '../model/utils'

type MyPostFilterProps = {
  tableReport?: ApplicationTableReportControls
}

const MyPostFilter = ({ tableReport }: MyPostFilterProps) => {
  const { isScrolled, ref } = useScroll(80)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const {
    postId,
    setPostId,
    userId,
    setUserId,
    posts,
    status,
    setStatus,
    updatedDate,
    setUpdatedDate,
  } = useMyPostFilterStore()

  const { data: applicantsData, isLoading: isApplicantsLoading } =
    usePartnerApplicantsQuery({ sort: 'name' })

  const postOptions = useMemo(() => {
    const map = new Map<string, string>()

    posts?.items.forEach(application => {
      const id = application.post?.id
      const title = application.post?.title

      if (id && title) {
        map.set(id, title)
      }
    })

    return Array.from(map.entries()).map(([id, title]) => ({
      id,
      label: title,
    }))
  }, [posts])

  const userOptions = useMemo(() => {
    const fromApi = (applicantsData?.items ?? [])
      .map(normalizePartnerUser)
      .map(mapPartnerUserToRow)
      .map(item => ({ id: item.id, label: item.name }))

    if (fromApi.length) return fromApi

    const map = new Map<string, string>()

    posts?.items.forEach(application => {
      const applicant = application.applicant

      if (!applicant?.id) return

      map.set(applicant.id, getPartnerName(applicant))
    })

    return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
  }, [applicantsData?.items, posts])

  const hasMobileDrawerFilters =
    status !== 'all' || postId !== 'all' || userId !== 'all'

  const handleDateChange = (date: Dayjs | null) => {
    setUpdatedDate(date ? date.format('YYYY-MM-DD') : null)
    setAnchorEl(null)
  }

  const handleClearDate = () => {
    setUpdatedDate(null)
    setAnchorEl(null)
  }

  return (
    <>
      <Stack
        ref={ref}
        direction="row"
        sx={{
          p: 2,
          mb: 1,
          bgcolor: 'white',
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
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
          direction="row"
          spacing={2}
          sx={{
            flex: 1,
            minWidth: 0,
            mr: 2,
            alignItems: 'center',
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <TextField
            select
            fullWidth
            label="Статус"
            value={status}
            size="small"
            onChange={event =>
              setStatus(event.target.value as ApplicationStatusFilter)
            }
            sx={{ flex: 1, minWidth: 0, maxWidth: 250 }}
          >
            <MenuItem value="all">Все</MenuItem>
            {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
              <MenuItem
                key={value}
                value={value}
              >
                {label}
              </MenuItem>
            ))}
          </TextField>

          <FilterAutocomplete
            label="Объявление"
            value={postId}
            size="small"
            options={postOptions}
            onChange={setPostId}
            sx={{ flex: 1, maxWidth: 250, minWidth: 250 }}
          />

          <FilterAutocomplete
            label="Пользователь"
            value={userId}
            size="small"
            options={userOptions}
            loading={isApplicantsLoading}
            onChange={setUserId}
            sx={{ flex: 1, maxWidth: 250, minWidth: 250 }}
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

          <MyPostViewModeToggle />

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
        <PostsResponsesMobileFilter
          open={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          postOptions={postOptions}
        />
      </Drawer>
    </>
  )
}

export default MyPostFilter
