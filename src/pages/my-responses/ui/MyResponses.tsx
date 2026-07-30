import { ReplyAllOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useMyApplicationsCompanyOptionsQuery,
  useMyApplicationsInfiniteQuery,
  useMyApplicationsQuery,
  useSearchMyApplicationsQuery,
  useWithdrawApplicationMutation,
  type Application,
} from '@/entities/application';
import { useFavoritePostIdsForPosts } from '@/entities/favorite';
import { useExecutorTasksByPostMap } from '@/entities/task';
import { EmptyBlock, InfiniteScrollSentinel, ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import {
  MY_RESPONSE_TABLE_PAGE_SIZE,
  MY_RESPONSE_VIEW_MODE_KEY,
} from '../model/constants';
import { exportMyResponsesReport } from '../model/exportMyResponsesReport';
import { fetchMyResponsesForReport } from '../model/fetchMyResponsesForReport';
import {
  filterApplicationsByCompany,
  hasActiveMyResponseFilters,
  toMyApplicationsParams,
  type ApplicationStatusFilter,
  type CompanyFilter,
} from '../model/utils';

import { ApplicationSearchResultItem } from './ApplicationSearchResultItem';
import MyResponsesFilter from './Filter';
import { MyResponseItem } from './MyResponseItem';
import { MyResponseItemSkeletonList } from './MyResponseItemSkeleton';
import { MyResponsesPrintHeader } from './MyResponsesPrintHeader';
import { MyResponsesTable } from './MyResponsesTable';

import type { MyResponseViewMode } from '../model/types';

const searchMessageBoxSx = {
  display: 'flex',
  justifyContent: 'center',
  bgcolor: 'white',
  borderRadius: '32px',
  border: '1px solid',
  borderColor: 'divider',
  py: 6,
} as const;

const getInitialViewMode = (): MyResponseViewMode => {
  const saved = localStorage.getItem(MY_RESPONSE_VIEW_MODE_KEY);

  if (saved === 'grid' || saved === 'table') return saved;

  return 'grid';
};

export const MyResponses = () => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const [status, setStatus] = useState<ApplicationStatusFilter>('all');
  const [updatedDate, setUpdatedDate] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<CompanyFilter>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchItems, setSearchItems] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<MyResponseViewMode>(getInitialViewMode);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [reportApplications, setReportApplications] = useState<
    Application[] | null
  >(null);

  const navigate = useNavigate();

  const isDesktopSearch = isSearchOpen && !isMobile;
  const isTableView = viewMode === 'table';
  const useServerTablePagination = isTableView && companyId === 'all';

  const handleViewModeChange = (value: MyResponseViewMode) => {
    localStorage.setItem(MY_RESPONSE_VIEW_MODE_KEY, value);
    setViewMode(value);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isDesktopSearch) {
      setTimeout(() => {
        setDebouncedQuery('');
        setSearchPage(1);
        setSearchItems([]);
      }, 0);
    }
  }, [isDesktopSearch]);

  useEffect(() => {
    setTimeout(() => {
      setSearchPage(1);
      setSearchItems([]);
    }, 0);
  }, [debouncedQuery]);

  const canSearch = isDesktopSearch && debouncedQuery.length >= 2;

  const listParams = useMemo(
    () => toMyApplicationsParams({ status, updatedDate }),
    [status, updatedDate]
  );

  const paginationResetKey = useMemo(
    () => [viewMode, status, updatedDate, companyId].join('|'),
    [viewMode, status, updatedDate, companyId]
  );

  const [tablePageState, setTablePageState] = useState({
    filterKey: '',
    page: 0,
  });

  const tablePage =
    tablePageState.filterKey === paginationResetKey ? tablePageState.page : 0;

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMyApplicationsInfiniteQuery(listParams, {
    enabled: !canSearch && (!isTableView || companyId !== 'all'),
  });

  const {
    data: tableData,
    isLoading: isTableLoading,
    isError: isTableError,
    refetch: refetchTable,
  } = useMyApplicationsQuery(
    toMyApplicationsParams(
      { status, updatedDate },
      { page: tablePage + 1, limit: MY_RESPONSE_TABLE_PAGE_SIZE }
    ),
    { enabled: !canSearch && useServerTablePagination }
  );

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    error: searchError,
  } = useSearchMyApplicationsQuery({
    q: canSearch ? debouncedQuery : '',
    page: searchPage,
    limit: 20,
  });

  useEffect(() => {
    if (!canSearch || !searchData) return;

    setTimeout(() => {
      setSearchItems(prev =>
        searchPage === 1 ? searchData.items : [...prev, ...searchData.items]
      );
    }, 0);
  }, [canSearch, searchData, searchPage]);

  const { data: companyOptions = [] } = useMyApplicationsCompanyOptionsQuery();
  const { data: executorTasksByPostMap } = useExecutorTasksByPostMap();

  const applications = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data]
  );

  const infiniteVisibleApplications = useMemo(
    () => filterApplicationsByCompany(applications, companyId),
    [applications, companyId]
  );

  const tableApplications = useMemo(() => {
    if (useServerTablePagination) {
      return tableData?.items ?? [];
    }

    return infiniteVisibleApplications;
  }, [
    useServerTablePagination,
    tableData?.items,
    infiniteVisibleApplications,
  ]);

  const visibleApplications = isTableView
    ? tableApplications
    : infiniteVisibleApplications;

  const postIds = useMemo(
    () =>
      visibleApplications
        .map(application => application.post?.id)
        .filter((id): id is string => Boolean(id)),
    [visibleApplications]
  );

  const { favoritePostIds } = useFavoritePostIdsForPosts(postIds);

  const { mutate: withdrawApplication } = useWithdrawApplicationMutation();

  const hasActiveFilters = hasActiveMyResponseFilters({
    status,
    updatedDate,
    companyId,
  });

  const isFilterEmpty = !updatedDate && status === 'all' && companyId === 'all';

  const feedIsLoading = useServerTablePagination ? isTableLoading : isLoading;
  const feedIsError = useServerTablePagination ? isTableError : isError;
  const feedRefetch = useServerTablePagination ? refetchTable : refetch;

  const isInitialLoading = feedIsLoading && !visibleApplications.length;
  const isEmpty =
    !isInitialLoading && !feedIsError && !visibleApplications.length;
  const showFilter = Boolean(
    applications.length ||
      tableApplications.length ||
      !isFilterEmpty ||
      isSearchOpen ||
      isTableView
  );
  const tableReportDisabled = feedIsLoading || isEmpty;
  const printApplications = reportApplications ?? visibleApplications;

  const searchHasMore = Boolean(
    searchData && searchData.page * searchData.limit < searchData.total
  );

  const reportOptions = useMemo(
    () => ({
      status,
      updatedDate,
      companyId,
    }),
    [status, updatedDate, companyId]
  );

  useEffect(() => {
    if (!pendingPrint || viewMode !== 'table' || !reportApplications) return;

    let cancelled = false;
    let innerFrameId = 0;

    const outerFrameId = requestAnimationFrame(() => {
      innerFrameId = requestAnimationFrame(() => {
        if (cancelled) return;

        const handleAfterPrint = () => {
          setPendingPrint(false);
          setReportApplications(null);
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
  }, [pendingPrint, viewMode, reportApplications]);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      const items = await fetchMyResponsesForReport(reportOptions);

      setReportApplications(items);
      localStorage.setItem(MY_RESPONSE_VIEW_MODE_KEY, 'table');
      setViewMode('table');
      setPendingPrint(true);
    } catch (error) {
      console.error('Failed to prepare my responses for print', error);
    } finally {
      setIsPrinting(false);
    }
  }, [reportOptions]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const items = await fetchMyResponsesForReport(reportOptions);

      exportMyResponsesReport(items);
    } catch (error) {
      console.error('Failed to export my responses', error);
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

  useEffect(() => {
    if (
      companyId === 'all' ||
      infiniteVisibleApplications.length > 0 ||
      !hasNextPage ||
      isFetchingNextPage ||
      canSearch ||
      useServerTablePagination
    ) {
      return;
    }

    void fetchNextPage();
  }, [
    companyId,
    infiniteVisibleApplications.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    canSearch,
    useServerTablePagination,
  ]);

  useEffect(() => {
    if (
      !isTableView ||
      companyId === 'all' ||
      !hasNextPage ||
      isFetchingNextPage ||
      canSearch
    ) {
      return;
    }

    void fetchNextPage();
  }, [
    isTableView,
    companyId,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    canSearch,
  ]);

  const handleResetFilters = () => {
    setStatus('all');
    setUpdatedDate(null);
    setCompanyId('all');
  };

  const handleWithdraw = (applicationId: string) => {
    setWithdrawingId(applicationId);
    withdrawApplication(applicationId, {
      onSettled: () => setWithdrawingId(null),
    });
  };

  const handleOpenSearchResult = (postId: string) => {
    navigate(`${ROUTES.POST}/${postId}`);
  };

  const handleTablePageChange = (_: unknown, nextPage: number) => {
    setTablePageState({ filterKey: paginationResetKey, page: nextPage });
  };

  const renderSearchContent = () => {
    if (isSearchLoading && searchItems.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (searchError) {
      return (
        <Box sx={searchMessageBoxSx}>
          <EmptyBlock title="Не удалось выполнить поиск" />
        </Box>
      );
    }

    if (!searchItems.length) {
      return (
        <Box sx={searchMessageBoxSx}>
          <EmptyBlock
            title="Ничего не найдено"
            description="Попробуйте изменить запрос"
          />
        </Box>
      );
    }

    return (
      <Stack
        spacing={1.5}
        sx={{ width: '100%' }}
      >
        {searchItems.map(application => (
          <ApplicationSearchResultItem
            key={application.id}
            application={application}
            highlightQuery={debouncedQuery}
            onOpen={handleOpenSearchResult}
          />
        ))}

        {searchHasMore && (
          <Button
            variant="outlined"
            disabled={isSearchFetching}
            onClick={() => setSearchPage(prev => prev + 1)}
          >
            {isSearchFetching ? 'Загрузка…' : 'Загрузить ещё'}
          </Button>
        )}
      </Stack>
    );
  };

  const renderFeedContent = () => (
    <>
      {isInitialLoading && !isTableView && (
        <MyResponseItemSkeletonList count={6} />
      )}

      {isInitialLoading && isTableView && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: 'white',
            borderRadius: '32px',
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      )}

      {feedIsError && (
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
            title="Не удалось загрузить отклики"
            buttonText="Повторить"
            buttonOnClick={() => void feedRefetch()}
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
            flex: 1,
          }}
        >
          <Stack
            spacing={2}
            sx={{ alignItems: 'center', maxWidth: 400 }}
          >
            <ReplyAllOutlined sx={{ fontSize: 56, color: 'text.disabled' }} />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {hasActiveFilters
                ? 'По выбранным фильтрам ничего не найдено'
                : 'У вас пока нет откликов'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {hasActiveFilters
                ? 'Попробуйте изменить фильтры или сбросить их'
                : 'Откликайтесь на объявления на главной — они появятся здесь'}
            </Typography>
            <Button
              variant="contained"
              onClick={() =>
                hasActiveFilters ? handleResetFilters() : navigate(ROUTES.INDEX)
              }
            >
              {hasActiveFilters ? 'Сбросить фильтры' : 'На главную'}
            </Button>
          </Stack>
        </Box>
      )}

      {!isInitialLoading &&
        !feedIsError &&
        (visibleApplications.length > 0 ||
          Boolean(reportApplications?.length)) && (
        <Box
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
              {visibleApplications.map(application => {
                const postId = application.post?.id ?? '';
                const task = postId
                  ? executorTasksByPostMap?.get(postId)
                  : undefined;

                return (
                  <MyResponseItem
                    key={application.id}
                    application={application}
                    withdrawingId={withdrawingId}
                    onWithdraw={handleWithdraw}
                    isFavorite={favoritePostIds.has(postId)}
                    taskId={task?.id ?? null}
                  />
                );
              })}
            </Box>
          )}

          {(isTableView || reportApplications) && (
            <>
              <MyResponsesPrintHeader total={printApplications.length} />

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
                  <MyResponsesTable
                    page={tablePage}
                    applications={visibleApplications}
                    total={
                      useServerTablePagination
                        ? (tableData?.total ?? 0)
                        : visibleApplications.length
                    }
                    serverPagination={useServerTablePagination}
                    withdrawingId={withdrawingId}
                    taskByPostId={executorTasksByPostMap}
                    onWithdraw={handleWithdraw}
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
                <MyResponsesTable
                  applications={printApplications}
                  paginated={false}
                  forPrint
                  onWithdraw={handleWithdraw}
                />
              </Box>
            </>
          )}
        </Box>
      )}

      {!isTableView &&
        !isInitialLoading &&
        !feedIsError &&
        visibleApplications.length > 0 && (
          <InfiniteScrollSentinel
            hasMore={Boolean(hasNextPage)}
            isLoading={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        )}
    </>
  );

  return (
    <PageLayout
      withFooter={!isTableView || canSearch}
      isScreenHeight={isTableView && !canSearch}
      printHide={isTableView && !canSearch}
    >
      {showFilter && (
        <Box
          className="print-no-print"
          sx={{
            top: 0,
            zIndex: 1000,
            position: 'sticky',
            flexShrink: 0,
          }}
        >
          <MyResponsesFilter
            status={status}
            companyId={companyId}
            updatedDate={updatedDate}
            companyOptions={companyOptions}
            onStatusChange={setStatus}
            onCompanyChange={setCompanyId}
            onUpdatedDateChange={setUpdatedDate}
            searchQuery={searchQuery}
            isSearchOpen={isSearchOpen}
            onSearchQueryChange={setSearchQuery}
            onSearchOpenChange={setIsSearchOpen}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            tableReport={tableReport}
          />
        </Box>
      )}

      {canSearch ? renderSearchContent() : renderFeedContent()}
    </PageLayout>
  );
};

export default MyResponses;
