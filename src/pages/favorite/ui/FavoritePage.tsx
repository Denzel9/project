import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  isFavoritePostItem,
  isFavoriteUserItem,
  useMyApplicationsMapForPosts,
  useFavoritesInfiniteQuery,
  useFavoritesQuery,
  type FavoriteListItem,
  type FavoriteType,
} from '@/entities';
import { EmptyBlock, InfiniteScrollSentinel, ROUTES, stickyFilterSx } from '@/shared';
import {
  ACTION_BUTTONS_KEYS,
  PostItem,
  PostItemSkeletonList,
  PageLayout,
} from '@/widgets';

import {
  FAVORITE_TABLE_PAGE_SIZE,
  FAVORITE_VIEW_MODE_KEY,
} from '../model/constants';
import { exportFavoritesReport } from '../model/exportFavoritesReport';
import { fetchFavoritesForReport } from '../model/fetchFavoritesForReport';
import {
  toFavoriteInfiniteListParams,
  toFavoriteListParams,
  type FavoriteGroupFilter,
} from '../model/utils';

import { FavoritesPrintHeader } from './FavoritesPrintHeader';
import { FavoritesTable } from './FavoritesTable';
import { FavoriteUserItemCard } from './FavoriteUserItemCard';
import FavoriteFilter from './Filter';

import type { FavoriteViewMode } from '../model/types';

const getInitialViewMode = (): FavoriteViewMode => {
  const saved = localStorage.getItem(FAVORITE_VIEW_MODE_KEY);

  if (saved === 'grid' || saved === 'table') return saved;

  return 'grid';
};

export const FavoritePage = () => {
  const [groupFilter, setGroupFilter] = useState<FavoriteGroupFilter>('all');
  const [favoriteType, setFavoriteType] = useState<FavoriteType>('POST');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] = useState<FavoriteViewMode>(getInitialViewMode);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [reportItems, setReportItems] = useState<FavoriteListItem[] | null>(
    null
  );

  const navigate = useNavigate();

  const isTableView = viewMode === 'table';

  const handleViewModeChange = (value: FavoriteViewMode) => {
    localStorage.setItem(FAVORITE_VIEW_MODE_KEY, value);
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

  const paginationResetKey = useMemo(
    () => [viewMode, favoriteType, groupFilter, searchQ ?? ''].join('|'),
    [viewMode, favoriteType, groupFilter, searchQ]
  );

  const [tablePageState, setTablePageState] = useState({
    filterKey: '',
    page: 0,
  });

  const tablePage =
    tablePageState.filterKey === paginationResetKey ? tablePageState.page : 0;

  const listParams = useMemo(
    () =>
      toFavoriteInfiniteListParams(groupFilter, {
        type: favoriteType,
        q: searchQ,
      }),
    [groupFilter, favoriteType, searchQ]
  );

  const {
    data,
    isLoading: isFeedLoading,
    isError: isFeedError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFavoritesInfiniteQuery(listParams, {
    enabled: !isTableView,
  });

  const {
    data: tableData,
    isLoading: isTableLoading,
    isError: isTableError,
  } = useFavoritesQuery(
    toFavoriteListParams(groupFilter, {
      type: favoriteType,
      q: searchQ,
      pagination: {
        page: tablePage + 1,
        limit: FAVORITE_TABLE_PAGE_SIZE,
      },
    }),
    { enabled: isTableView }
  );

  const feedFavorites = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data]
  );

  const tableFavorites = useMemo(() => tableData?.items ?? [], [tableData]);

  const favorites = isTableView ? tableFavorites : feedFavorites;

  const isLoading = isTableView ? isTableLoading : isFeedLoading;
  const isError = isTableView ? isTableError : isFeedError;

  const postFavorites = useMemo(
    () => favorites.filter(isFavoritePostItem),
    [favorites]
  );

  const userFavorites = useMemo(
    () => favorites.filter(isFavoriteUserItem),
    [favorites]
  );

  const reportPostItems = useMemo(
    () => (reportItems ?? []).filter(isFavoritePostItem),
    [reportItems]
  );

  const reportUserItems = useMemo(
    () => (reportItems ?? []).filter(isFavoriteUserItem),
    [reportItems]
  );

  const postIds = useMemo(
    () => postFavorites.map(favorite => favorite.postId),
    [postFavorites]
  );

  const { map: myApplicationsMap } = useMyApplicationsMapForPosts(postIds);

  const isInitialLoading = isLoading && !favorites.length;
  const isFilterEmpty = favoriteType === 'POST' ? groupFilter === 'all' : true;
  const visibleItems = favoriteType === 'POST' ? postFavorites : userFavorites;
  const isEmpty = !isInitialLoading && !visibleItems.length;
  const tableReportDisabled = isLoading || isEmpty;

  const printTitle =
    favoriteType === 'POST'
      ? 'Избранные посты'
      : favoriteType === 'CREATOR'
        ? 'Избранные исполнители'
        : 'Избранные компании';

  const printItems = reportItems ?? favorites;

  const emptyTitle = searchQ
    ? 'Ничего не найдено'
    : favoriteType === 'POST'
      ? 'В избранном пока нет постов'
      : favoriteType === 'CREATOR'
        ? 'В избранном пока нет исполнителей'
        : 'В избранном пока нет компаний';

  const reportOptions = useMemo(
    () => ({
      favoriteType,
      groupFilter,
      q: searchQ,
    }),
    [favoriteType, groupFilter, searchQ]
  );

  useEffect(() => {
    if (!pendingPrint || viewMode !== 'table' || !reportItems) return;

    let cancelled = false;
    let innerFrameId = 0;

    const outerFrameId = requestAnimationFrame(() => {
      innerFrameId = requestAnimationFrame(() => {
        if (cancelled) return;

        const handleAfterPrint = () => {
          setPendingPrint(false);
          setReportItems(null);
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
  }, [pendingPrint, viewMode, reportItems]);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      const items = await fetchFavoritesForReport(reportOptions);

      setReportItems(items);
      localStorage.setItem(FAVORITE_VIEW_MODE_KEY, 'table');
      setViewMode('table');
      setPendingPrint(true);
    } catch (error) {
      console.error('Failed to prepare favorites for print', error);
    } finally {
      setIsPrinting(false);
    }
  }, [reportOptions]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const items = await fetchFavoritesForReport(reportOptions);

      exportFavoritesReport(items, favoriteType);
    } catch (error) {
      console.error('Failed to export favorites', error);
    } finally {
      setIsExporting(false);
    }
  }, [favoriteType, reportOptions]);

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
      {Boolean(
        favorites.length ||
        !isFilterEmpty ||
        favoriteType !== 'POST' ||
        isSearchOpen ||
        isTableView
      ) && (
          <Box
            className="print-no-print"
            sx={stickyFilterSx}
          >
            <FavoriteFilter
              value={groupFilter}
              onChange={setGroupFilter}
              favoriteType={favoriteType}
              onTypeChange={setFavoriteType}
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

      <Box
        sx={{
          gap: 1,
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isError && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              bgcolor: 'background.paper',
              borderRadius: '32px',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <EmptyBlock
              title={
                searchQ
                  ? 'Не удалось выполнить поиск'
                  : 'Не удалось загрузить избранное'
              }
            />
          </Box>
        )}

        {!isError && isInitialLoading && !isTableView && (
          <PostItemSkeletonList count={5} />
        )}

        {!isError && isInitialLoading && isTableView && (
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

        {!isError && isEmpty && (
          <Box
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              bgcolor: 'background.paper',
              borderRadius: '32px',
              justifyContent: 'center',
            }}
          >
            <EmptyBlock
              sx={{
                height: 'auto',
              }}
              title={emptyTitle}
              description={
                searchQ ? 'Попробуйте изменить запрос' : undefined
              }
              buttonText={searchQ ? undefined : 'На главную'}
              buttonOnClick={
                searchQ ? undefined : () => navigate(ROUTES.INDEX)
              }
            />
          </Box>
        )}

        {!isError &&
          !isInitialLoading &&
          !isEmpty &&
          (visibleItems.length > 0 || Boolean(reportItems?.length)) && (
            <Box
              sx={{
                gap: 1,
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: isTableView ? 0 : undefined,
              }}
            >
              {!isTableView &&
                favoriteType === 'POST' &&
                postFavorites.map(favorite => {
                  const application = myApplicationsMap.get(favorite.postId);

                  return (
                    <PostItem
                      key={favorite.postId}
                      post={favorite.post}
                      isFavorite
                      isApplied={Boolean(application)}
                      applicationStatus={application?.status}
                      applicationId={application?.id}
                      permissions={[
                        ...(favorite.groupId === null
                          ? [ACTION_BUTTONS_KEYS.ADD_TO_FAVORITE_GROUP]
                          : []),
                        ACTION_BUTTONS_KEYS.REMOVE_FROM_COLLECTION,
                      ]}
                    />
                  );
                })}

              {!isTableView && favoriteType !== 'POST' && (
                <Grid
                  container
                  spacing={1.5}
                >
                  {userFavorites.map(favorite => (
                    <Grid
                      key={favorite.userId}
                      size={{ xs: 12, md: 6 }}
                      sx={{ display: 'flex' }}
                    >
                      <FavoriteUserItemCard favorite={favorite} />
                    </Grid>
                  ))}
                </Grid>
              )}

              <FavoritesPrintHeader
                title={printTitle}
                total={printItems.length}
              />

              {(isTableView || reportItems) && (
                <>


                  {isTableView && (
                    <Box
                      className="print-no-print"
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                      }}
                    >
                      <FavoritesTable
                        favoriteType={favoriteType}
                        postItems={postFavorites}
                        userItems={userFavorites}
                        page={tablePage}
                        total={tableData?.total ?? 0}
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
                    <FavoritesTable
                      favoriteType={favoriteType}
                      postItems={
                        reportItems ? reportPostItems : postFavorites
                      }
                      userItems={
                        reportItems ? reportUserItems : userFavorites
                      }
                      paginated={false}
                      forPrint
                    />
                  </Box>
                </>
              )}
            </Box>
          )}

        {!isError && !isTableView && hasNextPage && (
          <InfiniteScrollSentinel
            hasMore={Boolean(hasNextPage)}
            isLoading={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        )}
      </Box>
    </PageLayout>
  );
};

export default FavoritePage;
