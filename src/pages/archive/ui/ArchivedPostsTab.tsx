import { LockOutlined, UnarchiveOutlined } from '@mui/icons-material';
import { Box, CircularProgress, Stack } from '@mui/material';
import { keepPreviousData } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  USER_ROLE,
  usePostsInfiniteQuery,
  usePostsQuery,
  useUpdatePostMutation,
  type Post,
  type PostListParams,
} from '@/entities';
import { useAuthStore, useRequireEmailConfirmed } from '@/features/auth';
import { TasksPrintHeader } from '@/pages/my-tasks/ui/TasksPrintHeader';
import { EmptyBlock, InfiniteScrollSentinel } from '@/shared';
import {
  ACTION_BUTTONS_KEYS,
  PostItem,
  PostItemSkeletonList,
  PostSelectionBar,
  useSnackbarStore,
} from '@/widgets';

import {
  ARCHIVE_POSTS_VIEW_MODE_KEY,
  ARCHIVE_TABLE_PAGE_SIZE,
  type ArchiveTableReport,
  type ArchiveViewMode,
} from '../model/constants';
import { exportArchivedPostsReport } from '../model/exportArchivedPostsReport';
import { fetchAllArchivedPosts } from '../model/fetchAllArchivedPosts';

import {
  ArchivedPostTable,
  type ArchivedPostColumnFilters,
} from './ArchivedPostTable';

const ARCHIVED_POST_PERMISSIONS = [
  ACTION_BUTTONS_KEYS.EDIT,
  ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
  ACTION_BUTTONS_KEYS.MAKE_PRIVATE,
];

type ArchivedPostsTabProps = {
  viewMode: ArchiveViewMode;
  onViewModeChange: (viewMode: ArchiveViewMode) => void;
  onTableReportChange: (report: ArchiveTableReport | null) => void;
  searchQuery?: string;
  isSelectionMode: boolean;
  onSelectionModeChange: (value: boolean) => void;
};

export const ArchivedPostsTab = ({
  viewMode,
  onViewModeChange,
  onTableReportChange,
  searchQuery = '',
  isSelectionMode,
  onSelectionModeChange,
}: ArchivedPostsTabProps) => {
  const { id, role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;
  const isTableView = viewMode === 'table';
  const ownerId = id || '';

  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [reportPosts, setReportPosts] = useState<Post[] | null>(null);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [isPrivate, setIsPrivate] = useState<'all' | 'true' | 'false'>('all');
  const [createdDate, setCreatedDate] = useState<string | null>(null);
  const [deadlineDate, setDeadlineDate] = useState<string | null>(null);
  const [tablePageState, setTablePageState] = useState({
    filterKey: '',
    page: 0,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const { setSnackbarOpen } = useSnackbarStore();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();
  const { mutateAsync: updatePost } = useUpdatePostMutation();

  const contentRef = useRef<HTMLDivElement>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    onSelectionModeChange(false);
  }, [onSelectionModeChange]);

  useEffect(() => {
    if (!isSelectionMode) {
      setTimeout(() => {
        setSelectedIds([]);
      }, 0);
    }
  }, [isSelectionMode]);

  const handleEnterSelectionMode = useCallback(() => {
    onSelectionModeChange(true);
  }, [onSelectionModeChange]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [q]);

  const resetFilters = useCallback(() => {
    setQ('');
    setDebouncedQ('');
    setUrgentOnly(false);
    setIsPrivate('all');
    setCreatedDate(null);
    setDeadlineDate(null);
  }, []);

  const prevViewModeRef = useRef(viewMode);

  useEffect(() => {
    if (prevViewModeRef.current === viewMode) return;
    prevViewModeRef.current = viewMode;
    resetFilters();
  }, [viewMode, resetFilters]);

  useEffect(() => {
    localStorage.setItem(ARCHIVE_POSTS_VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const baseParams = useMemo((): Omit<PostListParams, 'page'> => {
    const fromColumn = debouncedQ.length >= 2 ? debouncedQ : undefined;
    const fromHeader = searchQuery.trim().length >= 2 ? searchQuery.trim() : undefined;
    const resolvedQ = fromColumn || fromHeader;

    return {
      limit: ARCHIVE_TABLE_PAGE_SIZE,
      ownerId,
      isArchived: true,
      ...(urgentOnly && { urgent: true }),
      ...(isPrivate !== 'all' && { isPrivate: isPrivate === 'true' }),
      ...(createdDate && { createdDate }),
      ...(deadlineDate && { deadlineDate }),
      ...(resolvedQ && { q: resolvedQ }),
    };
  }, [
    ownerId,
    urgentOnly,
    isPrivate,
    createdDate,
    deadlineDate,
    debouncedQ,
    searchQuery,
  ]);

  const paginationResetKey = useMemo(
    () =>
      [
        viewMode,
        urgentOnly,
        isPrivate,
        createdDate,
        deadlineDate,
        debouncedQ,
        searchQuery,
      ].join('|'),
    [
      viewMode,
      urgentOnly,
      isPrivate,
      createdDate,
      deadlineDate,
      debouncedQ,
      searchQuery,
    ],
  );

  const tablePage =
    tablePageState.filterKey === paginationResetKey ? tablePageState.page : 0;

  const tableQueryParams = useMemo(
    () => ({
      ...baseParams,
      page: tablePage + 1,
      limit: ARCHIVE_TABLE_PAGE_SIZE,
    }),
    [baseParams, tablePage],
  );

  const { data: tableData, isLoading: isTableLoading } = usePostsQuery(
    tableQueryParams,
    { enabled: isTableView && Boolean(ownerId) },
  );

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePostsInfiniteQuery(baseParams, {
    placeholderData: keepPreviousData,
    enabled: !isTableView && Boolean(ownerId),
  });

  const listPosts = useMemo(
    () => infiniteData?.pages.flatMap(page => page.items) ?? [],
    [infiniteData?.pages],
  );

  const filteredPosts = isTableView ? (tableData?.items ?? []) : listPosts;
  const totalPosts = isTableView
    ? tableData?.total
    : infiniteData?.pages[0]?.total;
  const isLoading = isTableView ? isTableLoading : isInfiniteLoading;
  const isEmpty = !isLoading && !filteredPosts.length;
  const tableReportDisabled = isLoading || isEmpty;

  const columnFilters = useMemo<ArchivedPostColumnFilters>(
    () => ({
      q,
      urgentOnly,
      isPrivate,
      createdDate,
      deadlineDate,
      onQChange: setQ,
      onUrgentOnlyChange: setUrgentOnly,
      onIsPrivateChange: setIsPrivate,
      onCreatedDateChange: setCreatedDate,
      onDeadlineDateChange: setDeadlineDate,
    }),
    [q, urgentOnly, isPrivate, createdDate, deadlineDate],
  );

  useEffect(() => {
    setTimeout(() => {
      clearSelection();
    }, 0);
  }, [paginationResetKey, viewMode, clearSelection]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    filteredPosts.length > 0 &&
    filteredPosts.every(post => selectedIdSet.has(post.id));

  const handleToggleSelect = (postId: string) => {
    setSelectedIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId],
    );
  };

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(filteredPosts.map(post => post.id));
  };

  const applyBulkUpdate = async (
    body: { isArchived?: boolean; isPrivate?: boolean },
    successOne: string,
    successMany: (count: number) => string,
    failMessage: string,
  ) => {
    if (!requireEmailConfirmed()) return;
    if (selectedIds.length === 0 || isBulkUpdating) return;

    setIsBulkUpdating(true);

    try {
      const results = await Promise.allSettled(
        selectedIds.map(id => updatePost({ id, body })),
      );

      const successCount = results.filter(
        result => result.status === 'fulfilled',
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0 && failCount === 0) {
        setSnackbarOpen(
          true,
          successCount === 1 ? successOne : successMany(successCount),
        );
        clearSelection();
        return;
      }

      if (successCount > 0) {
        const failedIds = selectedIds.filter(
          (_, index) => results[index]?.status === 'rejected',
        );
        setSelectedIds(failedIds);
        setSnackbarOpen(
          true,
          `Успешно: ${successCount}, не удалось: ${failCount}`,
          'error',
        );
        return;
      }

      setSnackbarOpen(true, failMessage, 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkUnarchive = () => {
    void applyBulkUpdate(
      { isArchived: false },
      'Пост возвращен из архива',
      count => `Из архива возвращено постов: ${count}`,
      'Не удалось вернуть посты из архива',
    );
  };

  const handleBulkMakePrivate = () => {
    void applyBulkUpdate(
      { isPrivate: true },
      'Пост сделан приватным',
      count => `Сделано приватными постов: ${count}`,
      'Не удалось сделать посты приватными',
    );
  };

  const handleTablePageChange = (_: unknown, nextPage: number) => {
    setTablePageState({ filterKey: paginationResetKey, page: nextPage });
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchReportPosts = useCallback(async () => {
    const { ...params } = baseParams;

    return fetchAllArchivedPosts(params);
  }, [baseParams]);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      const posts = await fetchReportPosts();
      setReportPosts(posts);
      onViewModeChange('table');
      setPendingPrint(true);
    } catch (error) {
      console.error('Failed to prepare archived posts report for print', error);
      setIsPrinting(false);
    }
  }, [fetchReportPosts, onViewModeChange]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const posts = await fetchReportPosts();
      exportArchivedPostsReport(posts);
    } catch (error) {
      console.error('Failed to export archived posts report', error);
    } finally {
      setIsExporting(false);
    }
  }, [fetchReportPosts]);

  useEffect(() => {
    onTableReportChange({
      disabled: tableReportDisabled,
      isExporting,
      isPrinting,
      onPrint: () => {
        void handlePrint();
      },
      onExport: () => {
        void handleExport();
      },
    });

    return () => onTableReportChange(null);
  }, [
    onTableReportChange,
    tableReportDisabled,
    isExporting,
    isPrinting,
    handlePrint,
    handleExport,
  ]);

  useEffect(() => {
    if (!pendingPrint || viewMode !== 'table' || !reportPosts) return;

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const handleAfterPrint = () => {
          setPendingPrint(false);
          setReportPosts(null);
          setIsPrinting(false);
        };

        window.addEventListener('afterprint', handleAfterPrint, { once: true });
        window.print();
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pendingPrint, viewMode, reportPosts]);

  const printPosts = reportPosts ?? filteredPosts;

  if (isLoading && !filteredPosts.length && !isTableView) {
    return (
      <PostItemSkeletonList
        count={5}
        isCompact
      />
    );
  }

  return (
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
      {isLoading && !filteredPosts.length && isTableView ? (
        <Box
          className="print-no-print"
          sx={{
            py: 8,
            display: 'flex',
            justifyContent: 'center',
            border: '1px solid',
            borderRadius: '24px',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : isEmpty && !isTableView ? (
        <Box
          className="print-no-print"
          sx={{
            py: 6,
            flex: 1,
            height: '100%',
            display: 'flex',
            bgcolor: 'background.paper',
            border: '1px solid',
            alignItems: 'center',
            borderRadius: '24px',
            borderColor: 'divider',
            justifyContent: 'center',
          }}
        >
          <EmptyBlock title="Архивных постов нет" />
        </Box>
      ) : (
        <Box
          sx={{
            gap: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '24px',
            border: isTableView ? '1px solid' : 'none',
            borderColor: 'divider',
            ...(isTableView && {
              flex: 1,
              minHeight: 0,
            }),
            '@media print': {
              border: 'none',
              borderRadius: 0,
            },
          }}
        >
          <Box
            ref={contentRef}
            sx={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              ...(isTableView && {
                flex: 1,
                minHeight: 0,
              }),
              '@media print': {
                overflow: 'visible',
              },
            }}
          >
            {viewMode === 'grid' && (
              <>
                <Stack
                  spacing={1}
                  className="print-no-print"
                  sx={{
                    transition: 'opacity 120ms ease',
                    opacity: isPlaceholderData ? 0.72 : 1,
                    pb: isSelectionMode ? 12 : 0,
                  }}
                >
                  {filteredPosts.map(post => (
                    <PostItem
                      isCompact
                      post={post}
                      key={post.id}
                      permissions={ARCHIVED_POST_PERMISSIONS}
                      isMyPost
                      isCompany={isCompany}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedIdSet.has(post.id)}
                      onToggleSelect={() => handleToggleSelect(post.id)}
                      onEnterSelectionMode={handleEnterSelectionMode}
                    />
                  ))}
                </Stack>

                <InfiniteScrollSentinel
                  onLoadMore={fetchNextPage}
                  isLoading={isFetchingNextPage}
                  hasMore={Boolean(hasNextPage) && !isPlaceholderData}
                />
              </>
            )}

            {(isTableView || reportPosts) && (
              <>
                <TasksPrintHeader
                  total={printPosts.length}
                  title="Архив постов"
                />

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
                    <ArchivedPostTable
                      page={tablePage}
                      total={totalPosts}
                      posts={filteredPosts}
                      serverPagination
                      onPageChange={handleTablePageChange}
                      columnFilters={columnFilters}
                      emptyText="Архивных постов нет"
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
                  <ArchivedPostTable
                    posts={printPosts}
                    paginated={false}
                    forPrint
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}

      {isSelectionMode && viewMode === 'grid' && (
        <PostSelectionBar
          selectedCount={selectedIds.length}
          totalCount={filteredPosts.length}
          isUpdating={isBulkUpdating}
          onClose={clearSelection}
          onSelectAll={handleSelectAll}
          actions={[
            {
              label: 'Вернуть из архива',
              icon: <UnarchiveOutlined />,
              variant: 'outlined',
              color: 'inherit',
              onClick: handleBulkUnarchive,
            },
            {
              label: 'Сделать приватным',
              icon: <LockOutlined />,
              variant: 'contained',
              color: 'primary',
              onClick: handleBulkMakePrivate,
            },
          ]}
        />
      )}
    </Stack>
  );
};
