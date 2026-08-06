import { PublicOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import {
  usePublicationsInfiniteQuery,
  usePublicationsQuery,
  type Publication,
} from '@/entities/publication';
import {
  EmptyBlock,
  InfiniteScrollSentinel,
  ROUTES,
  type FilterAutocompleteOption,
} from '@/shared';
import { PageLayout } from '@/widgets';

import {
  PUBLICATION_TABLE_PAGE_SIZE,
  PUBLICATION_VIEW_MODE_KEY,
} from '../model/constants';
import { exportPublicationsReport } from '../model/exportPublicationsReport';
import { fetchPublicationsForReport } from '../model/fetchPublicationsForReport';
import {
  getPublicationExecutorOptions,
  getPublicationPostOptions,
  getPublicationTitleOptions,
  hasActivePublicationFilters,
  parsePublicationSearchParams,
  PUBLICATION_PLATFORM_FILTER_OPTIONS,
  toPublicationsParams,
  type PublicationExecutorFilter,
  type PublicationPlatformFilter,
  type PublicationPostFilter,
} from '../model/utils';

import { PublicationItem } from './PublicationItem';
import { PublicationItemSkeletonList } from './PublicationItemSkeleton';
import { PublicationsFilter } from './PublicationsFilter';
import { PublicationsPrintHeader } from './PublicationsPrintHeader';
import { PublicationTable } from './PublicationTable';

import type {
  PublicationTableColumnFilters,
  PublicationViewMode,
} from '../model/types';

const FILTER_SEARCH_MIN = 2;
const FILTER_SEARCH_LIMIT = 20;

const getInitialViewMode = (): PublicationViewMode => {
  if (typeof window === 'undefined') return 'grid';

  const stored = localStorage.getItem(PUBLICATION_VIEW_MODE_KEY);

  return stored === 'table' ? 'table' : 'grid';
};

export const PublicationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const deepLinkFilters = useMemo(
    () => parsePublicationSearchParams(searchParams),
    [searchParams]
  );
  const deepLinkPostTitle = useMemo(() => {
    const state = location.state as { postTitle?: string } | null;

    return state?.postTitle?.trim() || undefined;
  }, [location.state]);

  const [viewMode, setViewMode] =
    useState<PublicationViewMode>(getInitialViewMode);
  const [q, setQ] = useState('');
  const [postId, setPostId] = useState<PublicationPostFilter>(
    deepLinkFilters.postId ?? 'all'
  );
  const [executorId, setExecutorId] = useState<PublicationExecutorFilter>(
    deepLinkFilters.executorId ?? 'all'
  );
  const [platform, setPlatform] = useState<PublicationPlatformFilter>('all');
  const [createdDate, setCreatedDate] = useState<string | null>(null);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [executorSearchQuery, setExecutorSearchQuery] = useState('');
  const [titleSearchQuery, setTitleSearchQuery] = useState('');
  const [selectedPostOption, setSelectedPostOption] =
    useState<FilterAutocompleteOption | null>(null);
  const [selectedExecutorOption, setSelectedExecutorOption] =
    useState<FilterAutocompleteOption | null>(null);
  const [selectedTitleOption, setSelectedTitleOption] =
    useState<FilterAutocompleteOption | null>(null);
  const [isTableFilterRowOpen, setIsTableFilterRowOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [reportPublications, setReportPublications] = useState<
    Publication[] | null
  >(null);
  const [pendingPrint, setPendingPrint] = useState(false);

  useEffect(() => {
    if (deepLinkFilters.postId) {
      setTimeout(() => {
        setPostId(deepLinkFilters.postId ?? 'all');
        if (deepLinkFilters.postId && deepLinkPostTitle) {
          setSelectedPostOption({
            id: deepLinkFilters.postId,
            label: deepLinkPostTitle,
          });
        }
      }, 0);
    }

    if (deepLinkFilters.executorId) {
      setTimeout(() => {
        setExecutorId(deepLinkFilters.executorId ?? 'all');
        setViewMode('table');
      }, 0);
    }
  }, [deepLinkFilters.executorId, deepLinkFilters.postId, deepLinkPostTitle]);

  const isTableView = viewMode === 'table';
  const useServerTablePagination = isTableView;

  const listParams = useMemo(
    () =>
      toPublicationsParams({
        q,
        postId,
        executorId,
        platform,
        taskId: deepLinkFilters.taskId,
        createdDate,
      }),
    [q, postId, executorId, platform, deepLinkFilters.taskId, createdDate]
  );

  const paginationResetKey = useMemo(
    () =>
      [
        viewMode,
        q,
        postId,
        executorId,
        platform,
        createdDate ?? '',
        deepLinkFilters.taskId ?? '',
        deepLinkFilters.postId ?? '',
      ].join('|'),
    [viewMode, q, postId, executorId, platform, createdDate, deepLinkFilters]
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

  const canSearchPosts = postSearchQuery.trim().length >= FILTER_SEARCH_MIN;
  const canSearchExecutors =
    executorSearchQuery.trim().length >= FILTER_SEARCH_MIN;
  const canSearchTitles = titleSearchQuery.trim().length >= FILTER_SEARCH_MIN;
  const allowOptionSearch = !isTableView || isTableFilterRowOpen;

  const titleQ = titleSearchQuery.trim();
  const postQ = postSearchQuery.trim();
  const sharedTitlePostQ =
    titleQ.length >= FILTER_SEARCH_MIN
      ? titleQ
      : postQ.length >= FILTER_SEARCH_MIN
        ? postQ
        : '';
  const canSearchTitleOrPost = sharedTitlePostQ.length >= FILTER_SEARCH_MIN;

  const {
    data: titlePostSearchData,
    isFetching: isTitlePostSearchFetching,
  } = usePublicationsQuery(
    {
      q: sharedTitlePostQ,
      page: 1,
      limit: FILTER_SEARCH_LIMIT,
    },
    { enabled: canSearchTitleOrPost && allowOptionSearch },
  );

  const { data: executorSearchData, isFetching: isExecutorSearchFetching } =
    usePublicationsQuery(
      {
        executorQ: executorSearchQuery.trim(),
        page: 1,
        limit: FILTER_SEARCH_LIMIT,
      },
      { enabled: canSearchExecutors && allowOptionSearch },
    );

  const infinitePublications = useMemo(
    () => infiniteData?.pages.flatMap(page => page.items) ?? [],
    [infiniteData]
  );

  const rawPublications = useMemo(
    () =>
      useServerTablePagination
        ? (tableData?.items ?? [])
        : infinitePublications,
    [useServerTablePagination, tableData, infinitePublications]
  );

  const visiblePublications = rawPublications;

  const postOptions = useMemo(() => {
    if (!canSearchPosts || !allowOptionSearch || sharedTitlePostQ !== postQ) {
      return [];
    }

    return getPublicationPostOptions(titlePostSearchData?.items ?? []).map(
      ([id, label]) => ({
        id,
        label,
      }),
    );
  }, [
    allowOptionSearch,
    canSearchPosts,
    postQ,
    sharedTitlePostQ,
    titlePostSearchData?.items,
  ]);

  const executorOptions = useMemo(() => {
    if (!canSearchExecutors || !allowOptionSearch) return [];

    return getPublicationExecutorOptions(executorSearchData?.items ?? []).map(
      ([id, label]) => ({
        id,
        label,
      }),
    );
  }, [allowOptionSearch, canSearchExecutors, executorSearchData?.items]);

  const titleOptions = useMemo(() => {
    if (!canSearchTitles || !allowOptionSearch || sharedTitlePostQ !== titleQ) {
      return [];
    }

    return getPublicationTitleOptions(titlePostSearchData?.items ?? []).map(
      ([id, label]) => ({
        id,
        label,
      }),
    );
  }, [
    allowOptionSearch,
    canSearchTitles,
    sharedTitlePostQ,
    titlePostSearchData?.items,
    titleQ,
  ]);

  const handlePostChange = useCallback(
    (value: PublicationPostFilter) => {
      setPostId(value);

      if (value === 'all') {
        setSelectedPostOption(null);
        return;
      }

      setSelectedPostOption(current => {
        const fromSearch = postOptions.find(option => option.id === value);

        return fromSearch ?? (current?.id === value ? current : null);
      });
    },
    [postOptions],
  );

  const handleExecutorChange = useCallback(
    (value: PublicationExecutorFilter) => {
      setExecutorId(value);

      if (value === 'all') {
        setSelectedExecutorOption(null);
        return;
      }

      setSelectedExecutorOption(current => {
        const fromSearch = executorOptions.find(option => option.id === value);

        return fromSearch ?? (current?.id === value ? current : null);
      });
    },
    [executorOptions],
  );

  const handleTitleChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        setQ('');
        setSelectedTitleOption(null);
        return;
      }

      setQ(value);
      setSelectedTitleOption(current => {
        const fromSearch = titleOptions.find(option => option.id === value);

        return fromSearch ?? (current?.id === value ? current : { id: value, label: value });
      });
    },
    [titleOptions],
  );

  const handlePlatformChange = useCallback((value: string) => {
    setPlatform(
      value === 'all' ? 'all' : (value as PublicationPlatformFilter),
    );
  }, []);

  const hasActiveFilters = hasActivePublicationFilters({
    q,
    postId,
    executorId,
    platform,
    createdDate,
  });
  const isFilterEmpty =
    !q.trim() &&
    postId === 'all' &&
    executorId === 'all' &&
    platform === 'all' &&
    !createdDate;
  const isLoading = useServerTablePagination
    ? isTableLoading
    : isInfiniteLoading;
  const isError = useServerTablePagination ? isTableError : isInfiniteError;
  const isInitialLoading = isLoading && rawPublications.length === 0;
  const isEmpty =
    !isInitialLoading && !isError && visiblePublications.length === 0;
  const showFilter = Boolean(
    rawPublications.length || !isFilterEmpty || isTableView,
  );
  const tableReportDisabled = isLoading || isEmpty;

  const reportOptions = useMemo(
    () => ({
      q,
      postId,
      executorId,
      platform,
      createdDate,
      taskId: deepLinkFilters.taskId,
    }),
    [q, postId, executorId, platform, createdDate, deepLinkFilters.taskId]
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
    [handleExport, handlePrint, isExporting, isPrinting, tableReportDisabled]
  );

  const columnFilters = useMemo<PublicationTableColumnFilters>(
    () => ({
      title: {
        value: q.trim() || 'all',
        options: titleOptions,
        selectedOption: selectedTitleOption,
        label: 'Название',
        placeholder: 'Все названия',
        loading:
          canSearchTitles &&
          allowOptionSearch &&
          sharedTitlePostQ === titleQ &&
          isTitlePostSearchFetching,
        minInputLength: FILTER_SEARCH_MIN,
        onSearch: setTitleSearchQuery,
        onChange: handleTitleChange,
      },
      post: {
        value: postId,
        options: postOptions,
        selectedOption: selectedPostOption,
        label: 'Задача',
        placeholder: 'Все задачи',
        loading:
          canSearchPosts &&
          allowOptionSearch &&
          sharedTitlePostQ === postQ &&
          isTitlePostSearchFetching,
        minInputLength: FILTER_SEARCH_MIN,
        onSearch: setPostSearchQuery,
        onChange: handlePostChange,
      },
      platform: {
        value: platform,
        options: PUBLICATION_PLATFORM_FILTER_OPTIONS,
        label: 'Площадка',
        placeholder: 'Все площадки',
        onChange: handlePlatformChange,
      },
      executor: {
        value: executorId,
        options: executorOptions,
        selectedOption: selectedExecutorOption,
        label: 'Исполнитель',
        placeholder: 'Все исполнители',
        loading:
          canSearchExecutors && allowOptionSearch && isExecutorSearchFetching,
        minInputLength: FILTER_SEARCH_MIN,
        onSearch: setExecutorSearchQuery,
        onChange: handleExecutorChange,
      },
      createdDate,
      onCreatedDateChange: setCreatedDate,
    }),
    [
      allowOptionSearch,
      canSearchExecutors,
      canSearchPosts,
      canSearchTitles,
      createdDate,
      executorId,
      executorOptions,
      handleExecutorChange,
      handlePlatformChange,
      handlePostChange,
      handleTitleChange,
      isExecutorSearchFetching,
      isTitlePostSearchFetching,
      platform,
      postId,
      postOptions,
      postQ,
      q,
      selectedExecutorOption,
      selectedPostOption,
      selectedTitleOption,
      sharedTitlePostQ,
      titleOptions,
      titleQ,
    ],
  );

  const handleResetFilters = () => {
    setQ('');
    setPostId('all');
    setExecutorId('all');
    setPlatform('all');
    setCreatedDate(null);
    setSelectedTitleOption(null);
    setSelectedPostOption(null);
    setSelectedExecutorOption(null);
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
      printHide={isTableView}
    >
      <Box
        className={isTableView ? 'print-root' : undefined}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: isTableView ? '100%' : 'auto',
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
              flexShrink: 0,
              position: 'sticky',
            }}
          >
            <PublicationsFilter
              q={q}
              postId={postId}
              executorId={executorId}
              viewMode={viewMode}
              postOptions={postOptions}
              executorOptions={executorOptions}
              selectedPostOption={selectedPostOption}
              selectedExecutorOption={selectedExecutorOption}
              isPostSearchLoading={
                canSearchPosts &&
                allowOptionSearch &&
                sharedTitlePostQ === postQ &&
                isTitlePostSearchFetching
              }
              isExecutorSearchLoading={
                canSearchExecutors &&
                allowOptionSearch &&
                isExecutorSearchFetching
              }
              hasActiveFilters={hasActiveFilters}
              tableReport={tableReport}
              onQueryChange={setQ}
              onPostChange={handlePostChange}
              onExecutorChange={handleExecutorChange}
              onPostSearch={setPostSearchQuery}
              onExecutorSearch={setExecutorSearchQuery}
              onViewModeChange={setViewMode}
              onResetFilters={handleResetFilters}
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
              py: 6,
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: '32px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <EmptyBlock
              title="Не удалось загрузить публикации"
              buttonText="Повторить"
              buttonOnClick={handleRefetch}
            />
          </Box>
        )}

        {isEmpty && !isTableView && (
          <Box
            sx={{
              py: 8,
              px: 3,
              flex: 1,
              height: '100%',
              display: 'flex',
              bgcolor: 'white',
              borderRadius: '32px',
              border: '1px solid',
              borderColor: 'divider',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Stack
              spacing={2}
              sx={{ alignItems: 'center', maxWidth: 420, height: '100%' }}
            >
              <EmptyBlock
                sx={{ height: '100%' }}
                title={hasActiveFilters
                  ? 'По выбранным фильтрам ничего не найдено'
                  : 'Публикаций пока нет'}
                description={hasActiveFilters
                  ? 'Попробуйте изменить фильтры или сбросить их'
                  : 'Публикации появляются автоматически после завершения задач'}
                icon={<PublicOutlined sx={{ fontSize: 56, color: 'text.disabled' }} />}
              />
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
          (isTableView ||
            visiblePublications.length > 0 ||
            Boolean(reportPublications?.length)) && (
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
              {!isTableView && visiblePublications.length > 0 && (
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
                        flexDirection: 'column',
                        width: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      <PublicationTable
                        page={tablePage}
                        publications={visiblePublications}
                        total={
                          useServerTablePagination
                            ? (tableData?.total ?? 0)
                            : visiblePublications.length
                        }
                        serverPagination={useServerTablePagination}
                        onPageChange={handleTablePageChange}
                        onFilterRowOpenChange={setIsTableFilterRowOpen}
                        columnFilters={columnFilters}
                        emptyMessage={
                          hasActiveFilters
                            ? 'По выбранным фильтрам ничего не найдено'
                            : 'Публикаций пока нет'
                        }
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
