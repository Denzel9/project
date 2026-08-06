import {
  DownloadOutlined,
  PrintOutlined,
} from '@mui/icons-material';
import {
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';

import {
  FilterAutocomplete,
  useScroll,
  type FilterAutocompleteOption,
} from '@/shared';

import { SEARCH_MIN } from '../model/constants';

import { PublicationSearchPanel } from './PublicationSearchPanel';
import { PublicationViewModeToggle } from './PublicationViewModeToggle';

import type {
  PublicationTableReportControls,
  PublicationViewMode,
} from '../model/types';
import type {
  PublicationExecutorFilter,
  PublicationPostFilter,
} from '../model/utils';

type PublicationsFilterProps = {
  q: string;
  postId: PublicationPostFilter;
  executorId: PublicationExecutorFilter;
  viewMode: PublicationViewMode;
  postOptions: FilterAutocompleteOption[];
  executorOptions: FilterAutocompleteOption[];
  selectedPostOption?: FilterAutocompleteOption | null;
  selectedExecutorOption?: FilterAutocompleteOption | null;
  isPostSearchLoading?: boolean;
  isExecutorSearchLoading?: boolean;
  hasActiveFilters?: boolean;
  onQueryChange: (value: string) => void;
  onPostChange: (value: PublicationPostFilter) => void;
  onExecutorChange: (value: PublicationExecutorFilter) => void;
  onPostSearch: (query: string) => void;
  onExecutorSearch: (query: string) => void;
  onViewModeChange: (value: PublicationViewMode) => void;
  onResetFilters: () => void;
  tableReport?: PublicationTableReportControls;
};

export const PublicationsFilter = ({
  q,
  postId,
  executorId,
  viewMode,
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
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const { isScrolled, ref } = useScroll(150);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <Stack
        ref={ref}
        direction="row"
        className="print-no-print"
        sx={{
          px: 2,
          pb: 2,
          alignItems: 'center',
          pt: isScrolled ? 4 : 1,
          gap: 2,
          transition: 'all 0.3s ease',
          justifyContent: 'space-between',
          bgcolor: isScrolled ? 'white' : 'transparent',
          borderBottomLeftRadius: isScrolled ? '32px' : '0',
          borderBottomRightRadius: isScrolled ? '32px' : '0',
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
            display: viewMode === 'table' ? 'none' : 'flex',
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

          {hasActiveFilters && (
            <Chip
              label="Сбросить"
              variant="outlined"
              onClick={onResetFilters}
              sx={{ flexShrink: 0 }}
            />
          )}
        </Stack>

        {viewMode === 'table' && hasActiveFilters && (
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
            ml: viewMode === 'table' && !hasActiveFilters ? 'auto' : undefined,
          }}
        >
          {viewMode === 'table' && tableReport && (
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
        </Stack>
      </Stack>

      <PublicationSearchPanel
        open={isSearchOpen && isMobile}
        query={q}
        onClose={() => {
          setIsSearchOpen(false);
          onQueryChange('');
        }}
        onQueryChange={onQueryChange}
      />
    </>
  );
};
