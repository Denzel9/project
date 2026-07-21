import { PublicOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import {
  usePublicationsInfiniteQuery,
  usePublicationsQuery,
  type Publication,
} from '@/entities/publication';
import { EmptyBlock, InfiniteScrollSentinel, ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import {
  PUBLICATION_TABLE_PAGE_SIZE,
  PUBLICATION_VIEW_MODE_KEY,
} from '../model/constants';
import { exportPublicationsReport } from '../model/exportPublicationsReport';
import { fetchPublicationsForReport } from '../model/fetchPublicationsForReport';
import {
  filterPublicationsByExecutor,
  getPublicationExecutorOptions,
  getPublicationPostOptions,
  hasActivePublicationFilters,
  parsePublicationSearchParams,
  toPublicationsParams,
  type PublicationExecutorFilter,
  type PublicationPostFilter,
} from '../model/utils';

import { PublicationItem } from './PublicationItem';
import { PublicationItemSkeletonList } from './PublicationItemSkeleton';
import { PublicationsFilter } from './PublicationsFilter';
import { PublicationsPrintHeader } from './PublicationsPrintHeader';
import { PublicationTable } from './PublicationTable';

import type { PublicationViewMode } from '../model/types';

const getInitialViewMode = (): PublicationViewMode => {
  if (typeof window === 'undefined') return 'grid';

  const stored = localStorage.getItem(PUBLICATION_VIEW_MODE_KEY);

  return stored === 'table' ? 'table' : 'grid';
};

export const PublicationsPage = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const deepLinkFilters = useMemo(
    () => parsePublicationSearchParams(searchParams),
    [searchParams]
  );

  const [viewMode, setViewMode] =
    useState<PublicationViewMode>(getInitialViewMode);
  const [q, setQ] = useState('');
  const [postId, setPostId] = useState<PublicationPostFilter>(
    deepLinkFilters.postId ?? 'all'
  );
  const [executorId, setExecutorId] =
    useState<PublicationExecutorFilter>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [reportPublications, setReportPublications] = useState<
    Publication[] | null
  >(null);
  const [pendingPrint, setPendingPrint] = useState(false);

  const isTableView = viewMode === 'table';
  const useServerTablePagination = isTableView && executorId === 'all';

  const listParams = useMemo(
    () =>
      toPublicationsParams({
        q,
        postId,
        ...deepLinkFilters,
      }),
    [q, postId, deepLinkFilters]
  );

  const paginationResetKey = useMemo(
    () =>
      [
        viewMode,
        q,
        postId,
        executorId,
        deepLinkFilters.taskId ?? '',
        deepLinkFilters.postId ?? '',
      ].join('|'),
    [viewMode, q, postId, executorId, deepLinkFilters]
  );

  const [tablePageState, setTablePageState] = useState({
    filterKey: '',
    page: 0,
  });

  const tablePage =
    tablePageState.filterKey === paginationResetKey ? tablePageState.page : 0;

  const tableQueryParams = useMemo(
    () => ({
      ...listParams,
      page: tablePage + 1,
      limit: PUBLICATION_TABLE_PAGE_SIZE,
    }),
    [listParams, tablePage]
  );

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isError: isInfiniteError,
    refetch: refetchInfinite,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePublicationsInfiniteQuery(listParams, {
    enabled: !useServerTablePagination,
    limit: PUBLICATION_TABLE_PAGE_SIZE,
  });

  const {
    data: tableData,
    isLoading: isTableLoading,
    isError: isTableError,
    refetch: refetchTable,
  } = usePublicationsQuery(tableQueryParams, {
    enabled: useServerTablePagination,
  });

  const infinitePublications = useMemo(
    () => infiniteData?.pages.flatMap(page => page.items) ?? [],
    [infiniteData]
  );

  const rawPublications = useServerTablePagination
    ? (tableData?.items ?? [])
    : infinitePublications;

  const visiblePublications = useMemo(
    () => filterPublicationsByExecutor(rawPublications, executorId),
    [rawPublications, executorId]
  );

  const postOptions = useMemo(
    () =>
      getPublicationPostOptions(rawPublications).map(([id, label]) => ({
        id,
        label,
      })),
    [rawPublications]
  );

  const executorOptions = useMemo(
    () =>
      getPublicationExecutorOptions(rawPublications).map(([id, label]) => ({
        id,
        label,
      })),
    [rawPublications]
  );

  const hasActiveFilters = hasActivePublicationFilters({
    q,
    postId,
    executorId,
  });
  const isFilterEmpty = !q.trim() && postId === 'all' && executorId === 'all';
  const isLoading = useServerTablePagination
    ? isTableLoading
    : isInfiniteLoading;
  const isError = useServerTablePagination ? isTableError : isInfiniteError;
  const isInitialLoading = isLoading && rawPublications.length === 0;
  const isEmpty =
    !isInitialLoading && !isError && visiblePublications.length === 0;
  const showFilter = Boolean(rawPublications.length || !isFilterEmpty);
  const tableReportDisabled = isLoading || isEmpty;

  const reportOptions = useMemo(
    () => ({
      q,
      postId,
      executorId,
      taskId: deepLinkFilters.taskId,
    }),
    [q, postId, executorId, deepLinkFilters.taskId],
  );

  const printPublications = reportPublications ?? visiblePublications;

  useEffect(() => {
    localStorage.setItem(PUBLICATION_VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!pendingPrint || viewMode !== 'table' || !reportPublications) return;

    let cancelled = false;
    let innerFrameId = 0;

    const outerFrameId = requestAnimationFrame(() => {
      innerFrameId = requestAnimationFrame(() => {
        if (cancelled) return;

        const handleAfterPrint = () => {
          setPendingPrint(false);
          setReportPublications(null);
        };

        window.addEventListener('afterprint', handleAfterPrint, { once: true });
        window.print();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerFrameId);
      cancelAnimationFrame(innerFrameId);
    };
  }, [pendingPrint, viewMode, reportPublications]);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      const publications = await fetchPublicationsForReport(reportOptions);

      setReportPublications(publications);
      setViewMode('table');
      setPendingPrint(true);
    } catch (error) {
      console.error('Failed to prepare publications report for print', error);
    } finally {
      setIsPrinting(false);
    }
  }, [reportOptions]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const publications = await fetchPublicationsForReport(reportOptions);

      exportPublicationsReport(publications);
    } catch (error) {
      console.error('Failed to export publications report', error);
    } finally {
      setIsExporting(false);
    }
  }, [reportOptions]);

  const tableReport = useMemo(
    () => ({
      disabled: tableReportDisabled,
      isExporting,
      isPrinting,
      onPrint: handlePrint,
      onExport: handleExport,
    }),
    [
      handleExport,
      handlePrint,
      isExporting,
      isPrinting,
      tableReportDisabled,
    ],
  );

  useEffect(() => {
    if (
      executorId === 'all' ||
      visiblePublications.length > 0 ||
      !hasNextPage ||
      isFetchingNextPage ||
      useServerTablePagination
    ) {
      return;
    }

    void fetchNextPage();
  }, [
    executorId,
    visiblePublications.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    useServerTablePagination,
  ]);

  const handleResetFilters = () => {
    setQ('');
    setPostId('all');
    setExecutorId('all');
  };

  const handleTablePageChange = (_: unknown, nextPage: number) => {
    setTablePageState({ filterKey: paginationResetKey, page: nextPage });
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefetch = () => {
    if (useServerTablePagination) {
      void refetchTable();
      return;
    }

    void refetchInfinite();
  };

  return (
    <PageLayout
      withFooter={!isTableView}
      isScreenHeight={isTableView}
      printHide={isTableView}
    >
      <Box
        className={isTableView ? 'print-root' : undefined}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: isTableView ? '100%' : 'auto',
          flex: isTableView ? 1 : undefined,
          minHeight: isTableView ? 0 : undefined,
          '@media print': {
            height: 'auto',
            minHeight: 'auto',
            overflow: 'visible',
            flex: 'none',
          },
        }}
      >
        {showFilter && (
          <Box
            sx={{
              top: 0,
              zIndex: 1000,
              position: 'sticky',
              flexShrink: 0,
            }}
          >
            <PublicationsFilter
              q={q}
              postId={postId}
              executorId={executorId}
              viewMode={viewMode}
              postOptions={postOptions}
              executorOptions={executorOptions}
              tableReport={tableReport}
              onQueryChange={setQ}
              onPostChange={setPostId}
              onExecutorChange={setExecutorId}
              onViewModeChange={setViewMode}
            />
          </Box>
        )}

        {isInitialLoading && !isTableView && (
          <PublicationItemSkeletonList count={6} />
        )}

        {isInitialLoading && isTableView && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: '32px',
              border: '1px solid',
              borderColor: 'divider',
              py: 6,
            }}
          >
            <EmptyBlock
              title="Не удалось загрузить публикации"
              buttonText="Повторить"
              buttonOnClick={handleRefetch}
            />
          </Box>
        )}

        {isEmpty && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: '32px',
              border: '1px dashed',
              borderColor: 'divider',
              py: 8,
              px: 3,
            }}
          >
            <Stack
              spacing={2}
              sx={{ alignItems: 'center', maxWidth: 420 }}
            >
              <PublicOutlined sx={{ fontSize: 56, color: 'text.disabled' }} />
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ textAlign: 'center' }}
              >
                {hasActiveFilters
                  ? 'По выбранным фильтрам ничего не найдено'
                  : 'Публикаций пока нет'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center' }}
              >
                {hasActiveFilters
                  ? 'Попробуйте изменить фильтры или сбросить их'
                  : 'Публикации появляются автоматически после завершения задач'}
              </Typography>
              <Button
                variant="contained"
                onClick={() =>
                  hasActiveFilters
                    ? handleResetFilters()
                    : navigate(ROUTES.MY_TASKS)
                }
              >
                {hasActiveFilters ? 'Сбросить фильтры' : 'К задачам'}
              </Button>
            </Stack>
          </Box>
        )}

        {!isInitialLoading &&
          !isError &&
          (visiblePublications.length > 0 || Boolean(reportPublications?.length)) && (
          <Box
            ref={contentRef}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              flex: isTableView ? 1 : undefined,
              minHeight: isTableView ? 0 : undefined,
            }}
          >
            {!isTableView && (
              <Box
                sx={{
                  gap: 1.5,
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                }}
              >
                {visiblePublications.map(publication => (
                  <PublicationItem
                    key={publication.id}
                    publication={publication}
                  />
                ))}
              </Box>
            )}

            {(isTableView || reportPublications) && (
              <>
                <PublicationsPrintHeader total={printPublications.length} />

                {isTableView && (
                  <Box
                    className="print-no-print"
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      display: 'flex',
                      width: '100%',
                    }}
                  >
                    <PublicationTable
                      page={tablePage}
                      publications={visiblePublications}
                      total={
                        useServerTablePagination
                          ? tableData?.total
                          : visiblePublications.length
                      }
                      serverPagination={useServerTablePagination}
                      onPageChange={handleTablePageChange}
                    />
                  </Box>
                )}

                <Box
                  className="print-only"
                  sx={{
                    display: 'none',
                    '@media print': {
                      display: 'flex',
                      width: '100%',
                    },
                  }}
                >
                  <PublicationTable
                    publications={printPublications}
                    paginated={false}
                    forPrint
                  />
                </Box>
              </>
            )}
          </Box>
        )}

        {!isTableView &&
          !isInitialLoading &&
          !isError &&
          visiblePublications.length > 0 && (
            <InfiniteScrollSentinel
              hasMore={Boolean(hasNextPage)}
              isLoading={isFetchingNextPage}
              onLoadMore={() => void fetchNextPage()}
            />
          )}
      </Box>
    </PageLayout>
  );
};

export default PublicationsPage;
