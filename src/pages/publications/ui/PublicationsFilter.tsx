import {
  Close,
  DownloadOutlined,
  PrintOutlined,
  Search,
} from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';

import { FilterAutocomplete } from '@/features';
import { useScroll } from '@/shared';

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

type FilterOption = {
  id: string;
  label: string;
};

type PublicationsFilterProps = {
  q: string;
  postId: PublicationPostFilter;
  executorId: PublicationExecutorFilter;
  viewMode: PublicationViewMode;
  postOptions: FilterOption[];
  executorOptions: FilterOption[];
  onQueryChange: (value: string) => void;
  onPostChange: (value: PublicationPostFilter) => void;
  onExecutorChange: (value: PublicationExecutorFilter) => void;
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
  onQueryChange,
  onPostChange,
  onExecutorChange,
  onViewModeChange,
  tableReport,
}: PublicationsFilterProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const { isScrolled, ref } = useScroll(150);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      onQueryChange('');
      return;
    }

    setIsSearchOpen(true);
  };

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
            onChange={onPostChange}
            sx={{ flex: 1 }}
          />

          <FilterAutocomplete
            label="Исполнитель"
            value={executorId}
            options={executorOptions}
            onChange={onExecutorChange}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', flexShrink: 0 }}
        >
          {isSearchOpen && !isMobile && (
            <TextField
              autoFocus
              label="Поиск"
              size="small"
              variant="outlined"
              value={q}
              onChange={event => onQueryChange(event.target.value)}
              sx={{ width: 300 }}
            />
          )}

          <IconButton
            color={q.trim() || isSearchOpen ? 'primary' : 'default'}
            onClick={handleToggleSearch}
          >
            {isSearchOpen ? <Close /> : <Search />}
          </IconButton>

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
