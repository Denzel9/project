import {
  DownloadOutlined,
  PrintOutlined,
  Tune,
} from '@mui/icons-material'
import {
  Button,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
} from '@mui/material'
import { useMemo, useState } from 'react'

import {
  FilterAutocomplete,
  useScroll,
  type FilterAutocompleteOption,
} from '@/shared'

import { SEARCH_MIN } from '../model/constants'
import { getPublicationLinkItems } from '../model/utils'

import { PublicationLinksDialog } from './PublicationLinksDialog'
import { PublicationSearchPanel } from './PublicationSearchPanel'
import { PublicationsMobileFilter } from './PublicationsMobileFilter'
import { PublicationViewModeToggle } from './PublicationViewModeToggle'

import type {
  PublicationTableReportControls,
  PublicationViewMode,
} from '../model/types'
import type {
  PublicationExecutorFilter,
  PublicationPostFilter,
} from '../model/utils'
import type { Publication } from '@/entities/publication'

type PublicationsFilterProps = {
  q: string
  postId: PublicationPostFilter
  executorId: PublicationExecutorFilter
  viewMode: PublicationViewMode
  publications?: Publication[]
  postOptions: FilterAutocompleteOption[]
  executorOptions: FilterAutocompleteOption[]
  selectedPostOption?: FilterAutocompleteOption | null
  selectedExecutorOption?: FilterAutocompleteOption | null
  isPostSearchLoading?: boolean
  isExecutorSearchLoading?: boolean
  hasActiveFilters?: boolean
  onQueryChange: (value: string) => void
  onPostChange: (value: PublicationPostFilter) => void
  onExecutorChange: (value: PublicationExecutorFilter) => void
  onPostSearch: (query: string) => void
  onExecutorSearch: (query: string) => void
  onViewModeChange: (value: PublicationViewMode) => void
  onResetFilters: () => void
  tableReport?: PublicationTableReportControls
}

export const PublicationsFilter = ({
  q,
  postId,
  executorId,
  viewMode,
  publications = [],
  postOptions,
  executorOptions,
  selectedPostOption = null,
  selectedExecutorOption = null,
  isPostSearchLoading = false,
  isExecutorSearchLoading = false,
  hasActiveFilters = false,
  onQueryChange,
  onPostChange,
  onExecutorChange,
  onPostSearch,
  onExecutorSearch,
  onViewModeChange,
  onResetFilters,
  tableReport,
}: PublicationsFilterProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))
  const { isScrolled, ref } = useScroll(80)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLinksOpen, setIsLinksOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const isGridMode = viewMode === 'grid'
  const isTableMode = viewMode === 'table'

  const hasMobileDrawerFilters = postId !== 'all' || executorId !== 'all'

  const linkItems = useMemo(
    () => getPublicationLinkItems(publications),
    [publications],
  )

  const linksButton = (
    <Button
      sx={{ px: 2, flexShrink: 0 }}
      onClick={() => setIsLinksOpen(true)}
    >
      Посмотреть ссылки
      {linkItems.length > 0 ? ` (${linkItems.length})` : ''}
    </Button>
  )

  return (
    <>
      <Stack
        ref={ref}
        direction="row"
        className="print-no-print"
        sx={{
          p: 2,
          gap: 2,
          mb: 1,
          bgcolor: 'white',
          alignItems: 'center',
          borderRadius: '24px',
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between',
          borderTopLeftRadius: isScrolled ? '0' : '24px',
          borderTopRightRadius: isScrolled ? '0' : '24px',
          boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: { xs: '100%', md: '50%' },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            display: isTableMode ? 'none' : { xs: 'none', md: 'flex' },
            alignItems: 'center',
          }}
        >
          <FilterAutocomplete
            size="small"
            label="Задача"
            value={postId}
            sx={{ flex: 1 }}
            options={postOptions}
            onSearch={onPostSearch}
            onChange={onPostChange}
            minInputLength={SEARCH_MIN}
            loading={isPostSearchLoading}
            selectedOption={selectedPostOption}
          />

          <FilterAutocomplete
            size="small"
            sx={{ flex: 1 }}
            label="Исполнитель"
            value={executorId}
            options={executorOptions}
            minInputLength={SEARCH_MIN}
            onSearch={onExecutorSearch}
            onChange={onExecutorChange}
            loading={isExecutorSearchLoading}
            selectedOption={selectedExecutorOption}
          />

          {linksButton}

          {hasActiveFilters && (
            <Chip
              label="Сбросить"
              variant="outlined"
              onClick={onResetFilters}
              sx={{ flexShrink: 0 }}
            />
          )}
        </Stack>

        {isGridMode && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              flex: 1,
              minWidth: 0,
            }}
          >
            {linksButton}
            {hasActiveFilters && (
              <Chip
                label="Сбросить"
                variant="outlined"
                onClick={onResetFilters}
                sx={{ flexShrink: 0 }}
              />
            )}
          </Stack>
        )}

        {isTableMode && linksButton}

        {isTableMode && hasActiveFilters && (
          <Chip
            label="Сбросить"
            variant="outlined"
            onClick={onResetFilters}
            sx={{ flexShrink: 0 }}
          />
        )}

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            flexShrink: 0,
            ml: isTableMode && !hasActiveFilters ? 'auto' : undefined,
          }}
        >
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

          <PublicationViewModeToggle
            viewMode={viewMode}
            onChange={onViewModeChange}
          />

          {isGridMode && (
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
          )}
        </Stack>
      </Stack>

      {isGridMode && (
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
          <PublicationsMobileFilter
            open={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
            postId={postId}
            executorId={executorId}
            postOptions={postOptions}
            executorOptions={executorOptions}
            selectedPostOption={selectedPostOption}
            selectedExecutorOption={selectedExecutorOption}
            isPostSearchLoading={isPostSearchLoading}
            isExecutorSearchLoading={isExecutorSearchLoading}
            onPostChange={onPostChange}
            onExecutorChange={onExecutorChange}
            onPostSearch={onPostSearch}
            onExecutorSearch={onExecutorSearch}
          />
        </Drawer>
      )}

      <PublicationSearchPanel
        open={isSearchOpen && isMobile}
        query={q}
        onClose={() => {
          setIsSearchOpen(false)
          onQueryChange('')
        }}
        onQueryChange={onQueryChange}
      />

      <PublicationLinksDialog
        open={isLinksOpen}
        links={linkItems}
        onClose={() => setIsLinksOpen(false)}
      />
    </>
  )
}
