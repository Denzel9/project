import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useMyApplicationsCompanyOptionsQuery,
  useMyApplicationsInfiniteQuery,
  useMyApplicationsQuery,
  useWithdrawApplicationMutation,
  type Application,
} from '@/entities/application';
import { useFavoritePostIdsForPosts } from '@/entities/favorite';
import { useExecutorTasksByPostMap } from '@/entities/task';
import { EmptyBlock, InfiniteScrollSentinel, ROUTES, stickyFilterSx } from '@/shared';
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
  DEFAULT_APPLICATION_STATUS_FILTER,
  type ApplicationStatusFilter,
  type CompanyFilter,
} from '../model/utils';

import MyResponsesFilter from './Filter';
import { MyResponseItem } from './MyResponseItem';
import { MyResponseItemSkeletonList } from './MyResponseItemSkeleton';
import { MyResponsesPrintHeader } from './MyResponsesPrintHeader';
import { MyResponsesTable } from './MyResponsesTable';

import type { MyResponseViewMode } from '../model/types';

const getInitialViewMode = (): MyResponseViewMode => {
  const saved = localStorage.getItem(MY_RESPONSE_VIEW_MODE_KEY);

  if (saved === 'grid' || saved === 'table') return saved;

  return 'grid';
};

export const MyResponses = () => {
  const [status, setStatus] = useState<ApplicationStatusFilter>([
    ...DEFAULT_APPLICATION_STATUS_FILTER,
  ]);
  const [updatedDate, setUpdatedDate] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<CompanyFilter>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] =
    useState<MyResponseViewMode>(getInitialViewMode);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [reportApplications, setReportApplications] = useState<
    Application[] | null
  >(null);

  const navigate = useNavigate();

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
    if (!isSearchOpen) {
      setTimeout(() => {
        setDebouncedQuery('');
      }, 0);
    }
  }, [isSearchOpen]);

  const searchQ =
    isSearchOpen && debouncedQuery.length >= 2 ? debouncedQuery : undefined;

  const listParams = useMemo(
    () => toMyApplicationsParams({ status, updatedDate, q: searchQ }),
    [status, updatedDate, searchQ]
  );

  const paginationResetKey = useMemo(
    () => [viewMode, status, updatedDate, companyId, searchQ ?? ''].join('|'),
    [viewMode, status, updatedDate, companyId, searchQ]
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
    enabled: !isTableView || companyId !== 'all',
  });

  const {
    data: tableData,
    isLoading: isTableLoading,
    isError: isTableError,
    refetch: refetchTable,
  } = useMyApplicationsQuery(
    toMyApplicationsParams(
      { status, updatedDate, q: searchQ },
      { page: tablePage + 1, limit: MY_RESPONSE_TABLE_PAGE_SIZE }
    ),
    { enabled: useServerTablePagination }
  );

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
    q: searchQ,
  });

  const feedIsLoading = useServerTablePagination ? isTableLoading : isLoading;
  const feedIsError = useServerTablePagination ? isTableError : isError;
  const feedRefetch = useServerTablePagination ? refetchTable : refetch;

  const isInitialLoading = feedIsLoading && !visibleApplications.length;
  const isEmpty =
    !isInitialLoading && !feedIsError && !visibleApplications.length;
  const tableReportDisabled = feedIsLoading || isEmpty;
  const printApplications = reportApplications ?? visibleApplications;

  const reportOptions = useMemo(
    () => ({
      status,
      updatedDate,
      companyId,
      q: searchQ,
    }),
    [status, updatedDate, companyId, searchQ]
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
    useServerTablePagination,
  ]);

  useEffect(() => {
    if (
      !isTableView ||
      companyId === 'all' ||
      !hasNextPage ||
      isFetchingNextPage
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
  ]);

  const handleResetFilters = () => {
    setStatus([]);
    setUpdatedDate(null);
    setCompanyId('all');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleWithdraw = (applicationId: string) => {
    setWithdrawingId(applicationId);
    withdrawApplication(applicationId, {
      onSettled: () => setWithdrawingId(null),
    });
  };

  const handleTablePageChange = (_: unknown, nextPage: number) => {
    setTablePageState({ filterKey: paginationResetKey, page: nextPage });
  };

  const emptyTitle = searchQ
    ? 'Ничего не найдено'
    : hasActiveFilters
      ? 'По выбранным фильтрам ничего не найдено'
      : 'У вас пока нет откликов';

  const emptyDescription = searchQ
    ? 'Попробуйте изменить запрос'
    : hasActiveFilters
      ? 'Попробуйте изменить фильтры или сбросить их'
      : 'Откликайтесь на объявления на главной — они появятся здесь';

  return (
    <PageLayout
      withFooter={!isTableView}
      isScreenHeight={isTableView}
      printHide={isTableView}
    >
      <Box
        className="print-no-print"
        sx={{
          ...stickyFilterSx,
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

      {isInitialLoading && !isTableView && (
        <MyResponseItemSkeletonList count={6} />
      )}

      {isInitialLoading && isTableView && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: 'background.paper',
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
            bgcolor: 'background.paper',
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
            flex: 1,
            display: 'flex',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderRadius: '32px',
            alignItems: 'center',
            borderColor: 'divider',
            justifyContent: 'center',
          }}
        >
          <EmptyBlock
            title={emptyTitle}
            description={emptyDescription}
            {...(hasActiveFilters
              ? {
                buttonText: 'Сбросить фильтры',
                buttonOnClick: handleResetFilters,
              }
              : {
                buttonText: 'На главную',
                buttonOnClick: () => navigate(ROUTES.INDEX),
              })}
          />
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
    </PageLayout>
  );
};

export default MyResponses;
