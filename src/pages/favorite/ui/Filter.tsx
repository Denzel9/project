import {
  Close,
  Delete,
  DownloadOutlined,
  PrintOutlined,
  Search,
  Tune,
} from '@mui/icons-material'
import {
  CircularProgress,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { useState } from 'react'

import { USER_ROLE } from '@/entities'
import {
  useDeleteFavoriteGroupMutation,
  useFavoriteGroupsQuery,
  type FavoriteGroup,
  type FavoriteType,
} from '@/entities/favorite'
import { useAuthStore } from '@/features'
import { useScroll } from '@/shared'
import { useSnackbarStore } from '@/widgets'

import { DeleteFavoriteGroupDialog } from './DeleteFavoriteGroupDialog'
import { FavoriteMobileFilter } from './FavoriteMobileFilter'
import { FavoriteViewModeToggle } from './FavoriteViewModeToggle'

import type {
  FavoriteTableReportControls,
  FavoriteViewMode,
} from '../model/types'
import type { FavoriteGroupFilter } from '../model/utils'

type FavoriteFilterProps = {
  value: FavoriteGroupFilter
  favoriteType: FavoriteType
  onChange: (value: FavoriteGroupFilter) => void
  onTypeChange: (value: FavoriteType) => void
  searchQuery: string
  isSearchOpen: boolean
  onSearchQueryChange: (value: string) => void
  onSearchOpenChange: (open: boolean) => void
  viewMode: FavoriteViewMode
  onViewModeChange: (value: FavoriteViewMode) => void
  tableReport?: FavoriteTableReportControls
}

const FavoriteFilter = ({
  value,
  favoriteType,
  onChange,
  onTypeChange,
  searchQuery,
  isSearchOpen,
  onSearchQueryChange,
  onSearchOpenChange,
  viewMode,
  onViewModeChange,
  tableReport,
}: FavoriteFilterProps) => {
  const { isScrolled, ref } = useScroll(150)
  const { role } = useAuthStore()
  const { setSnackbarOpen } = useSnackbarStore()
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const { data: groups, isLoading } = useFavoriteGroupsQuery(
    favoriteType === 'POST',
  )

  const { mutateAsync: deleteGroup, isPending } =
    useDeleteFavoriteGroupMutation()

  const [groupToDelete, setGroupToDelete] = useState<FavoriteGroup | null>(
    null,
  )

  const handleDeleteSuccess = (group: FavoriteGroup) => {
    if (value === group.id) {
      onChange('all')
    }

    setSnackbarOpen?.(
      true,
      group.count > 0
        ? 'Подборка удалена. Посты остались в избранном.'
        : 'Подборка удалена.',
    )
  }

  const handleDeleteGroup = async (group: FavoriteGroup) => {
    await deleteGroup(group.id)
    handleDeleteSuccess(group)
  }

  const handleDeleteClick = async (group: FavoriteGroup) => {
    if (group.count > 0) {
      setGroupToDelete(group)
      return
    }

    await handleDeleteGroup(group)
  }

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return

    await handleDeleteGroup(groupToDelete)
    setGroupToDelete(null)
  }

  const handleTypeChange = (nextType: FavoriteType) => {
    onTypeChange(nextType)

    if (nextType !== 'POST' && value !== 'all') {
      onChange('all')
    }
  }

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      onSearchOpenChange(false)
      onSearchQueryChange('')
      return
    }

    onSearchOpenChange(true)
  }

  const isCompany = role === USER_ROLE.COMPANY
  const hasMobileFilters =
    Boolean(searchQuery.trim()) ||
    favoriteType !== 'POST' ||
    value !== 'all'

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
          borderRadius: '24px',
          alignItems: 'center',
          borderColor: 'divider',
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
          spacing={1}
          sx={{
            width: { xs: '100%', md: '50%' },
            minWidth: 0,
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <TextField
            select
            size="small"
            label="Категория"
            value={favoriteType}
            sx={{ width: { md: '50%' } }}
            onChange={e => handleTypeChange(e.target.value as FavoriteType)}
          >
            <MenuItem value="POST">Посты</MenuItem>
            <MenuItem value={isCompany ? 'CREATOR' : 'COMPANY'}>
              {isCompany ? 'Исполнители' : 'Компании'}
            </MenuItem>
          </TextField>

          {favoriteType === 'POST' && (
            <TextField
              select
              size="small"
              value={value}
              label="Подборки"
              disabled={isLoading}
              sx={{ width: { md: '50%' } }}
              onChange={e => onChange(e.target.value as FavoriteGroupFilter)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="ungrouped">Без подборки</MenuItem>
              {groups?.map(group => (
                <MenuItem
                  key={group.id}
                  value={group.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <span>
                    {group.name} ({group.count})
                  </span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={isPending}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation()
                      void handleDeleteClick(group)
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </MenuItem>
              ))}
            </TextField>
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
          {isSearchOpen && (
            <TextField
              autoFocus
              label="Поиск"
              size="small"
              variant="outlined"
              value={searchQuery}
              onChange={event => onSearchQueryChange(event.target.value)}
              sx={{
                width: { xs: 160, sm: 220, md: 300 },
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

          <FavoriteViewModeToggle
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

      <DeleteFavoriteGroupDialog
        group={groupToDelete}
        isPending={isPending}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />

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
        <FavoriteMobileFilter
          open={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          value={value}
          favoriteType={favoriteType}
          onChange={onChange}
          onTypeChange={onTypeChange}
          searchQuery={searchQuery}
          onSearchQueryChange={value => {
            onSearchOpenChange(Boolean(value.trim()))
            onSearchQueryChange(value)
          }}
        />
      </Drawer>
    </>
  )
}

export default FavoriteFilter
