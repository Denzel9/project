import { DownloadOutlined, PrintOutlined, Search } from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';

import { useScroll } from '@/shared';

import { PublicationSearchPanel } from './PublicationSearchPanel';
import { PublicationViewModeToggle } from './PublicationViewModeToggle';

import type { PublicationTableReportControls, PublicationViewMode } from '../model/types';
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
  const { isScrolled, ref } = useScroll(150);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <Stack
        ref={ref}
        direction="row"
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
          <TextField
            select
            fullWidth
            size="small"
            label="Объявление"
            value={postId}
            onChange={event => onPostChange(event.target.value)}
            sx={{ minWidth: { xs: '100%', md: 220 } }}
          >
            <MenuItem value="all">Все</MenuItem>
            {postOptions.map(option => (
              <MenuItem
                key={option.id}
                value={option.id}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Исполнитель"
            value={executorId}
            onChange={event => onExecutorChange(event.target.value)}
            sx={{ minWidth: { xs: '100%', md: 220 } }}
          >
            <MenuItem value="all">Все</MenuItem>
            {executorOptions.map(option => (
              <MenuItem
                key={option.id}
                value={option.id}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', flexShrink: 0 }}
        >
          {viewMode === 'table' && tableReport && (
            <>
              <Tooltip title="Печать">
                <span>
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
                </span>
              </Tooltip>

              <Tooltip title="Экспорт CSV">
                <span>
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
                </span>
              </Tooltip>
            </>
          )}

          <PublicationViewModeToggle
            viewMode={viewMode}
            onChange={onViewModeChange}
          />

          <IconButton
            color={q.trim() ? 'primary' : 'default'}
            onClick={() => setIsSearchOpen(true)}
          >
            <Search />
          </IconButton>
        </Stack>
      </Stack>

      <PublicationSearchPanel
        open={isSearchOpen}
        query={q}
        onClose={() => setIsSearchOpen(false)}
        onQueryChange={onQueryChange}
      />
    </>
  );
};
