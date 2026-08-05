import {
  DownloadOutlined,
  PrintOutlined,
} from '@mui/icons-material';
import {
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
  onQueryChange: (value: string) => void;
  onPostChange: (value: PublicationPostFilter) => void;
  onExecutorChange: (value: PublicationExecutorFilter) => void;
  onPostSearch: (query: string) => void;
  onExecutorSearch: (query: string) => void;
  onViewModeChange: (value: PublicationViewMode) => void;
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
  onQueryChange,
  onPostChange,
  onExecutorChange,
  onPostSearch,
  onExecutorSearch,
  onViewModeChange,
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
          }}
        >
          <FilterAutocomplete
            label="Задача"
            value={postId}
            options={postOptions}
            selectedOption={selectedPostOption}
            loading={isPostSearchLoading}
            minInputLength={SEARCH_MIN}
            onSearch={onPostSearch}
            onChange={onPostChange}
            sx={{ flex: 1 }}
          />

          <FilterAutocomplete
            label="Исполнитель"
            value={executorId}
            options={executorOptions}
            selectedOption={selectedExecutorOption}
            loading={isExecutorSearchLoading}
            minInputLength={SEARCH_MIN}
            onSearch={onExecutorSearch}
            onChange={onExecutorChange}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', flexShrink: 0 }}
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
