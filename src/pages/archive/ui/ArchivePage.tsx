import { Close, DownloadOutlined, PrintOutlined, Search } from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useSearchParams } from 'react-router';

import { PageLayout } from '@/widgets';

import {
  ARCHIVE_POSTS_VIEW_MODE_KEY,
  ARCHIVE_TASKS_VIEW_MODE_KEY,
  getInitialArchiveViewMode,
  type ArchiveTableReport,
  type ArchiveViewMode,
} from '../model/constants';

import { ArchivedPostsTab } from './ArchivedPostsTab';
import { ArchivedTasksTab } from './ArchivedTasksTab';
import { ArchiveViewModeToggle } from './ArchiveViewModeToggle';

type ArchiveTab = 'posts' | 'tasks';

const TAB_ITEMS: { value: ArchiveTab; label: string }[] = [
  { value: 'posts', label: 'Посты' },
  { value: 'tasks', label: 'Задачи' },
];

const parseTab = (raw: string | null): ArchiveTab =>
  raw === 'tasks' ? 'tasks' : 'posts';

export const ArchivePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [postsViewMode, setPostsViewMode] = useState<ArchiveViewMode>(() =>
    getInitialArchiveViewMode(ARCHIVE_POSTS_VIEW_MODE_KEY),
  );
  const [tasksViewMode, setTasksViewMode] = useState<ArchiveViewMode>(() =>
    getInitialArchiveViewMode(ARCHIVE_TASKS_VIEW_MODE_KEY),
  );
  const [tableReport, setTableReport] = useState<ArchiveTableReport | null>(
    null,
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tasksSearchQuery, setTasksSearchQuery] = useState('');
  const [postsSearchQuery, setPostsSearchQuery] = useState('');
  const [debouncedTasksSearch, setDebouncedTasksSearch] = useState('');
  const [debouncedPostsSearch, setDebouncedPostsSearch] = useState('');

  const tab = useMemo(
    () => parseTab(searchParams.get('tab')),
    [searchParams],
  );

  const viewMode = tab === 'posts' ? postsViewMode : tasksViewMode;
  const isTableView = viewMode === 'table';
  const searchQuery = tab === 'posts' ? postsSearchQuery : tasksSearchQuery;
  const setSearchQuery =
    tab === 'posts' ? setPostsSearchQuery : setTasksSearchQuery;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (tab === 'posts') {
        setDebouncedPostsSearch(postsSearchQuery.trim());
      } else {
        setDebouncedTasksSearch(tasksSearchQuery.trim());
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [tab, postsSearchQuery, tasksSearchQuery]);

  const handleViewModeChange = useCallback(
    (next: ArchiveViewMode) => {
      if (tab === 'posts') {
        setPostsViewMode(next);
        return;
      }

      setTasksViewMode(next);
    },
    [tab],
  );

  const handleTabChange = (_: SyntheticEvent, next: ArchiveTab) => {
    setSearchParams(
      next === 'posts' ? {} : { tab: next },
      { replace: true },
    );
  };

  const handleToggleSearch = () => {
    setIsSearchOpen(current => {
      if (current) {
        setSearchQuery('');
      }
      return !current;
    });
  };

  return (
    <PageLayout
      withFooter={!isTableView}
      isScreenHeight={isTableView}
      printHide={isTableView}
    >
      <Stack
        spacing={1}
        className={isTableView ? 'print-root' : undefined}
        sx={{
          flex: 1,
          minHeight: 0,
          ...(isTableView && { height: '100%' }),
          '@media print': {
            height: 'auto',
            minHeight: 'auto',
            overflow: 'visible',
            flex: 'none',
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          className="print-no-print"
          sx={{
            p: 2,
            bgcolor: 'white',
            border: '1px solid',
            borderRadius: '24px',
            borderColor: 'divider',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ minWidth: 0, flex: 1 }}
          >
            {TAB_ITEMS.map(item => (
              <Tab
                key={item.value}
                value={item.value}
                label={item.label}
              />
            ))}
          </Tabs>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center', flexShrink: 0 }}
          >
            {isSearchOpen && (
              <TextField
                size="small"
                label={tab === 'tasks' ? 'Поиск задачи' : 'Поиск поста'}
                variant="outlined"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                autoFocus
                sx={{
                  width: { xs: 140, sm: 220 },
                  transition: 'width .3s ease-in-out',
                }}
              />
            )}

            <Tooltip title={isSearchOpen ? 'Скрыть поиск' : 'Поиск'}>
              <IconButton
                size="small"
                color={
                  isSearchOpen || Boolean(searchQuery.trim())
                    ? 'primary'
                    : 'default'
                }
                onClick={handleToggleSearch}
              >
                {isSearchOpen ? (
                  <Close fontSize="small" />
                ) : (
                  <Search fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {tableReport && (
              <>
                <Tooltip title="Печать">
                  <span>
                    <IconButton
                      size="small"
                      disabled={
                        tableReport.disabled || tableReport.isPrinting
                      }
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
                      disabled={
                        tableReport.disabled || tableReport.isExporting
                      }
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

            <ArchiveViewModeToggle
              viewMode={viewMode}
              onChange={handleViewModeChange}
            />
          </Stack>
        </Stack>

        {tab === 'posts' ? (
          <ArchivedPostsTab
            viewMode={postsViewMode}
            onViewModeChange={setPostsViewMode}
            onTableReportChange={setTableReport}
            searchQuery={debouncedPostsSearch}
          />
        ) : (
          <ArchivedTasksTab
            viewMode={tasksViewMode}
            onViewModeChange={setTasksViewMode}
            onTableReportChange={setTableReport}
            searchQuery={debouncedTasksSearch}
          />
        )}
      </Stack>
    </PageLayout>
  );
};

export default ArchivePage;
