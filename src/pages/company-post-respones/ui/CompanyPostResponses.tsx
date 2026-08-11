import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  useIncomingApplicationsQuery,
  type Application,
} from '@/entities/application';
import { EmptyBlock, stickyFilterSx } from '@/shared';
import { ROUTES } from '@/shared/config/routes';
import { IncomingApplicationItem, PageLayout } from '@/widgets';

import { APPLICATION_TABLE_PAGE_SIZE } from '../model/constants';
import { exportIncomingApplicationsReport } from '../model/exportIncomingApplicationsReport';
import { fetchIncomingApplicationsForReport } from '../model/fetchIncomingApplicationsForReport';
import { useMyPostFilterStore } from '../model/store';
import {
  toIncomingApplicationsParams,
  type ApplicationStatusFilter,
} from '../model/utils';

import Filter from './Filter';
import { IncomingApplicationItemSkeletonList } from './IncomingApplicationItemSkeleton';
import { IncomingApplicationsPrintHeader } from './IncomingApplicationsPrintHeader';
import { IncomingApplicationsTable } from './IncomingApplicationsTable';

const CompanyPostResponses = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    status,
    updatedDate,
    q,
    postId,
    userId,
    type: postType,
    viewMode,
    setPosts,
    setPostId,
    setUserId,
    setStatus,
    setViewMode,
    posts,
    resetFilters,
  } = useMyPostFilterStore();

  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [reportApplications, setReportApplications] = useState<
    Application[] | null
  >(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userIdFromUrl = searchParams.get('userId');
    const postIdFromUrl = searchParams.get('postId');
    const statusFromUrl = searchParams.get('status');

    let shouldReplace = false;

    if (
      userIdFromUrl &&
      userIdFromUrl !== 'all' &&
      userIdFromUrl !== 'undefined' &&
      userIdFromUrl !== 'null'
    ) {
      setUserId(userIdFromUrl);
      shouldReplace = true;
    }

    if (
      postIdFromUrl &&
      postIdFromUrl !== 'all' &&
      postIdFromUrl !== 'undefined' &&
      postIdFromUrl !== 'null'
    ) {
      setPostId(postIdFromUrl);
      shouldReplace = true;
    }

    if (
      statusFromUrl &&
      ['NEW', 'VIEWED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(
        statusFromUrl
      )
    ) {
      setStatus(statusFromUrl as ApplicationStatusFilter);
      shouldReplace = true;
    }

    if (shouldReplace) {
      navigate(location.pathname, { replace: true });
    }
  }, [
    location.pathname,
    location.search,
    navigate,
    setPostId,
    setStatus,
    setUserId,
  ]);

  const userIdFromUrl = (() => {
    const value = new URLSearchParams(location.search).get('userId');

    if (
      !value ||
      value === 'all' ||
      value === 'undefined' ||
      value === 'null'
    ) {
      return null;
    }

    return value;
  })();

  const effectiveUserId = userIdFromUrl ?? userId;
  const isTableView = viewMode === 'table';

  const paginationResetKey = useMemo(
    () =>
      [
        viewMode,
        status,
        updatedDate,
        q,
        postId,
        effectiveUserId,
        postType,
      ].join('|'),
    [viewMode, status, updatedDate, q, postId, effectiveUserId, postType]
  );

  const [tablePageState, setTablePageState] = useState({
    filterKey: '',
    page: 0,
  });

  const tablePage =
    tablePageState.filterKey === paginationResetKey ? tablePageState.page : 0;

  const reportOptions = useMemo(
    () => ({
      status,
      updatedDate,
      q,
      postId,
      userId: effectiveUserId,
      type: postType,
    }),
    [status, updatedDate, q, postId, effectiveUserId, postType]
  );

  const {
    data: applications,
    isLoading,
    isError,
    refetch,
  } = useIncomingApplicationsQuery(
    toIncomingApplicationsParams(
      reportOptions,
      isTableView
        ? { page: tablePage + 1, limit: APPLICATION_TABLE_PAGE_SIZE }
        : { page: 1, limit: 20 }
    )
  );

  useEffect(() => {
    if (!posts?.items?.length && applications) {
      setPosts(applications);
    }
  }, [applications, posts?.items?.length, setPosts]);

  const applicationItems = applications?.items ?? [];
  const printApplications = reportApplications ?? applicationItems;

  const isFilterEmpty =
    !updatedDate &&
    status === 'all' &&
    !q.trim() &&
    postType === 'all' &&
    postId === 'all' &&
    effectiveUserId === 'all';

  const hasActiveFilters = !isFilterEmpty;
  const isInitialLoading = isLoading && applicationItems.length === 0;
  const isEmpty =
    !isInitialLoading && !isError && applicationItems.length === 0;
  const showFilter = Boolean(applicationItems.length || hasActiveFilters);
  const tableReportDisabled = isLoading || isEmpty;

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
      const items = await fetchIncomingApplicationsForReport(reportOptions);

      setReportApplications(items);
      setViewMode('table');
      setPendingPrint(true);
    } catch (error) {
      console.error('Failed to prepare incoming applications for print', error);
    } finally {
      setIsPrinting(false);
    }
  }, [reportOptions, setViewMode]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const items = await fetchIncomingApplicationsForReport(reportOptions);

      exportIncomingApplicationsReport(items);
    } catch (error) {
      console.error('Failed to export incoming applications', error);
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

  const handleTablePageChange = (_: unknown, nextPage: number) => {
    setTablePageState({ filterKey: paginationResetKey, page: nextPage });
  };

  return (
    <PageLayout
      withFooter={!isTableView}
      isScreenHeight={isTableView}
      printHide={isTableView}
    >
      {showFilter && (
        <Box
          className="print-no-print"
          sx={{
            ...stickyFilterSx,
            flexShrink: 0,
          }}
        >
          <Filter tableReport={tableReport} />
        </Box>
      )}

      {isInitialLoading && !isTableView && (
        <IncomingApplicationItemSkeletonList count={6} />
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
            title="Не удалось загрузить отклики"
            buttonText="Повторить"
            buttonOnClick={() => void refetch()}
          />
        </Box>
      )}

      {isEmpty && (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'white',
            borderRadius: '32px',
            border: '1px solid',
            borderColor: 'divider',
            flex: 1,
          }}
        >
          <EmptyBlock
            title="Пока нет входящих откликов"
            description="Когда кандидаты откликнутся на ваши объявления, они появятся здесь"
            buttonText="На главную"
            buttonOnClick={() => navigate(ROUTES.INDEX)}
            hasActiveFilters={hasActiveFilters}
            resetFilters={resetFilters}
          />
        </Box>
      )}

      {!isInitialLoading &&
        !isError &&
        (applicationItems.length > 0 || Boolean(reportApplications?.length)) && (
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
                {applicationItems.map(application => (
                  <IncomingApplicationItem
                    key={application.id}
                    application={application}
                  />
                ))}
              </Box>
            )}

            {(isTableView || reportApplications) && (
              <>
                <IncomingApplicationsPrintHeader
                  total={printApplications.length}
                />

                {isTableView && (
                  <Box
                    className="print-no-print"
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      width: '100%',
                      display: 'flex',
                      overflow: 'hidden',
                      flexDirection: 'column',
                    }}
                  >
                    <IncomingApplicationsTable
                      page={tablePage}
                      applications={applicationItems}
                      total={applications?.total ?? 0}
                      serverPagination
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
                  <IncomingApplicationsTable
                    applications={printApplications}
                    paginated={false}
                    forPrint
                  />
                </Box>
              </>
            )}
          </Box>
        )}
    </PageLayout>
  );
};

export default CompanyPostResponses;
