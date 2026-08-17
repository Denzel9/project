import { CheckBox, CheckBoxOutlineBlank, LinkOutlined, OpenInNewOutlined } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { getPlatformLabel, type Platform } from '@/entities/post';
import {
  executorToUserPartial,
  UserDisplayName,
  type User,
} from '@/entities/user';
import { EmptyBlock, FilterAutocomplete, scrollMainToTop } from '@/shared';
import { FullScreenGallery, MediaPreview } from '@/widgets';
import { ColumnDateFilter } from '@/pages/my-tasks/ui/ColumnDateFilter';

import {
  PUBLICATION_TABLE_COLUMN_WIDTHS,
  PUBLICATION_TABLE_MIN_WIDTH,
  PUBLICATION_TABLE_PAGE_SIZE,
} from '../model/constants';
import {
  getPublicationGalleryMediaItems,
  getPublicationPlatformLinks,
  getPublicationPlatforms,
  getPublicationPostPath,
  getPublicationPostTitle,
  getPublicationPreviewMedia,
  getPublicationTaskPath,
  getPublicationTitle,
  publicationHasLink,
  sortPublications,
} from '../model/utils';

import { AttachPublicationLinkDialog } from './AttachPublicationLinkDialog';
import { PublicationColumnFilterButton } from './PublicationColumnFilterButton';

import type {
  PublicationSortField,
  PublicationSortOrder,
  PublicationTableColumnFilters,
} from '../model/types';
import type { Publication } from '@/entities/publication';
import type { TaskMedia } from '@/entities/task';
import type { MediaItemType } from '@/widgets/media/model/types';

const filteredColumnLabelSx = {
  color: 'primary.main',
  fontWeight: 600,
  '&:hover, &:focus, &.Mui-active, &.Mui-active:hover': {
    color: 'primary.main',
  },
} as const;

type PublicationTableProps = {
  publications: Publication[];
  total?: number;
  page?: number;
  forPrint?: boolean;
  paginated?: boolean;
  serverPagination?: boolean;
  rowsPerPage?: number;
  columnFilters?: PublicationTableColumnFilters;
  emptyMessage?: string;
  onPageChange?: (event: unknown, nextPage: number) => void;
  onFilterRowOpenChange?: (open: boolean) => void;
};

export const PublicationTable = ({
  publications,
  total,
  page: controlledPage,
  forPrint = false,
  paginated = true,
  serverPagination = false,
  rowsPerPage = PUBLICATION_TABLE_PAGE_SIZE,
  columnFilters,
  emptyMessage = 'Публикаций пока нет',
  onPageChange,
  onFilterRowOpenChange,
}: PublicationTableProps) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [galleryItems, setGalleryItems] = useState<MediaItemType[] | null>(
    null
  );
  const [attachLinkPublication, setAttachLinkPublication] =
    useState<Publication | null>(null);
  const [linkMenu, setLinkMenu] = useState<{
    anchor: HTMLElement;
    publication: Publication;
  } | null>(null);
  const [internalPage, setInternalPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<PublicationSortOrder>('desc');
  const [sortField, setSortField] = useState<PublicationSortField>('createdAt');
  const [isFilterRowOpen, setIsFilterRowOpen] = useState(false);

  useEffect(() => {
    onFilterRowOpenChange?.(isFilterRowOpen);
  }, [isFilterRowOpen, onFilterRowOpenChange]);

  const showColumnFilters = Boolean(columnFilters) && !forPrint;
  const hasActiveColumnFilter = Boolean(
    columnFilters &&
      (columnFilters.title.value !== 'all' ||
        columnFilters.post.value !== 'all' ||
        columnFilters.platform.value !== 'all' ||
        columnFilters.executor.value !== 'all' ||
        Boolean(columnFilters.createdDate)),
  );

  const isControlledPagination =
    controlledPage !== undefined && onPageChange !== undefined;

  const page = isControlledPagination ? controlledPage : internalPage;

  const sortedPublications = useMemo(
    () => sortPublications(publications, sortField, sortOrder),
    [publications, sortField, sortOrder]
  );

  const paginationCount = useMemo(() => {
    if (!serverPagination) {
      return sortedPublications.length;
    }

    const base = Math.max(total ?? 0, sortedPublications.length);

    if (
      sortedPublications.length >= rowsPerPage &&
      base <= (page + 1) * rowsPerPage
    ) {
      return (page + 1) * rowsPerPage + 1;
    }

    return base;
  }, [
    serverPagination,
    sortedPublications.length,
    total,
    page,
    rowsPerPage,
  ]);

  const pageCount = Math.max(1, Math.ceil(paginationCount / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);

  const visiblePublications = useMemo(() => {
    if (!paginated || serverPagination) return sortedPublications;

    const start = currentPage * rowsPerPage;

    return sortedPublications.slice(start, start + rowsPerPage);
  }, [
    sortedPublications,
    paginated,
    serverPagination,
    currentPage,
    rowsPerPage,
  ]);

  const isEmpty = visiblePublications.length === 0;

  const showPagination =
    paginated &&
    !forPrint &&
    !isEmpty &&
    (serverPagination
      ? paginationCount > rowsPerPage ||
      sortedPublications.length >= rowsPerPage
      : paginationCount > rowsPerPage);

  const scrollTableToTop = () => {
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    if (!forPrint) {
      scrollMainToTop('smooth');
    }
  };

  const handlePageChange = (event: unknown, nextPage: number) => {
    if (isControlledPagination) {
      onPageChange(event, nextPage);
      scrollTableToTop();
      return;
    }

    setInternalPage(nextPage);
    scrollTableToTop();
  };

  const handleSort = (field: PublicationSortField) => {
    if (forPrint) return;

    if (sortField === field) {
      setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    if (isControlledPagination) {
      onPageChange?.(null, 0);
    } else {
      setInternalPage(0);
    }
    setSortOrder(
      field === 'title' ||
        field === 'post' ||
        field === 'platform' ||
        field === 'executor'
        ? 'asc'
        : 'desc'
    );
  };

  const getSortDirection = (field: PublicationSortField) =>
    sortField === field ? sortOrder : false;

  const columnCellSx = (width: string | number) => ({
    p: 3,
    width,
    maxWidth: width,
    overflow: 'hidden',
    boxSizing: 'border-box',
  });

  const filterCellSx = (width: string | number) => ({
    py: 1.5,
    px: 3,
    width,
    maxWidth: width,
    verticalAlign: 'middle',
    boxSizing: 'border-box',
  });

  const mediaCellSx = {
    p: 2,
    width: PUBLICATION_TABLE_COLUMN_WIDTHS.media,
    maxWidth: PUBLICATION_TABLE_COLUMN_WIDTHS.media,
    overflow: 'visible',
    boxSizing: 'border-box',
  } as const;

  const handleOpenGallery = (event: MouseEvent, items: MediaItemType[]) => {
    event.stopPropagation();
    setGalleryItems(items);
  };

  const colSpan = 7;

  return (
    <>
      <Box
        className={forPrint ? 'print-table' : undefined}
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          height: forPrint ? 'auto' : '100%',
          display: 'flex',
          bgcolor: 'background.paper',
          overflow: forPrint ? 'visible' : 'hidden',
          flexDirection: 'column',
          borderRadius: forPrint ? 0 : { xs: '16px', md: '32px' },
          border: forPrint
            ? 'none'
            : theme => `1px solid ${theme.palette.secondary.main}`,
        }}
      >
        <TableContainer
          ref={tableContainerRef}
          sx={{
            width: '100%',
            scrollbarWidth: 'thin',
            scrollbarGutter: 'stable',
            ...(forPrint
              ? {
                height: 'auto',
                maxHeight: 'none',
                overflow: 'visible',
              }
              : {
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
              }),
          }}
        >
          <Table
            stickyHeader={!forPrint}
            sx={{
              tableLayout: 'fixed',
              width: '100%',
              ...(!forPrint && { minWidth: PUBLICATION_TABLE_MIN_WIDTH }),
            }}
          >
            <colgroup>
              <col style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.title }} />
              <col style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.post }} />
              <col
                style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.platform }}
              />
              <col
                style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.executor }}
              />
              <col
                style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.publishedAt }}
              />
              <col style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.media }} />
              {!forPrint && (
                <col
                  style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.actions }}
                />
              )}
            </colgroup>

            <TableHead>
              <TableRow>
                <TableCell
                  sortDirection={getSortDirection('title')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.title)}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <TableSortLabel
                      active={sortField === 'title'}
                      direction={sortField === 'title' ? sortOrder : 'asc'}
                      onClick={() => handleSort('title')}
                      hideSortIcon={forPrint}
                      sx={{
                        ...(forPrint && { pointerEvents: 'none' }),
                        ...(columnFilters?.title.value !== 'all' &&
                          filteredColumnLabelSx),
                      }}
                    >
                      Название
                    </TableSortLabel>

                    {showColumnFilters && columnFilters && (
                      <PublicationColumnFilterButton
                        title={columnFilters.title.label}
                        open={isFilterRowOpen}
                        active={columnFilters.title.value !== 'all'}
                        onClick={() => setIsFilterRowOpen(open => !open)}
                      />
                    )}
                  </Stack>
                </TableCell>

                <TableCell
                  sortDirection={getSortDirection('post')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.post)}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <TableSortLabel
                      active={sortField === 'post'}
                      direction={sortField === 'post' ? sortOrder : 'asc'}
                      onClick={() => handleSort('post')}
                      hideSortIcon={forPrint}
                      sx={{
                        ...(forPrint && { pointerEvents: 'none' }),
                        ...(columnFilters?.post.value !== 'all' &&
                          filteredColumnLabelSx),
                      }}
                    >
                      Пост
                    </TableSortLabel>

                    {showColumnFilters && columnFilters && (
                      <PublicationColumnFilterButton
                        title={columnFilters.post.label}
                        open={isFilterRowOpen}
                        active={columnFilters.post.value !== 'all'}
                        onClick={() => setIsFilterRowOpen(open => !open)}
                      />
                    )}
                  </Stack>
                </TableCell>

                <TableCell
                  sortDirection={getSortDirection('platform')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.platform)}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <TableSortLabel
                      active={sortField === 'platform'}
                      direction={sortField === 'platform' ? sortOrder : 'asc'}
                      onClick={() => handleSort('platform')}
                      hideSortIcon={forPrint}
                      sx={{
                        ...(forPrint && { pointerEvents: 'none' }),
                        ...(columnFilters?.platform.value !== 'all' &&
                          filteredColumnLabelSx),
                      }}
                    >
                      Площадки
                    </TableSortLabel>

                    {showColumnFilters && columnFilters && (
                      <PublicationColumnFilterButton
                        title={columnFilters.platform.label}
                        open={isFilterRowOpen}
                        active={columnFilters.platform.value !== 'all'}
                        onClick={() => setIsFilterRowOpen(open => !open)}
                      />
                    )}
                  </Stack>
                </TableCell>

                <TableCell
                  sortDirection={getSortDirection('executor')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.executor)}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <TableSortLabel
                      active={sortField === 'executor'}
                      direction={sortField === 'executor' ? sortOrder : 'asc'}
                      onClick={() => handleSort('executor')}
                      hideSortIcon={forPrint}
                      sx={{
                        ...(forPrint && { pointerEvents: 'none' }),
                        ...(columnFilters?.executor.value !== 'all' &&
                          filteredColumnLabelSx),
                      }}
                    >
                      Исполнитель
                    </TableSortLabel>

                    {showColumnFilters && columnFilters && (
                      <PublicationColumnFilterButton
                        title={columnFilters.executor.label}
                        open={isFilterRowOpen}
                        active={columnFilters.executor.value !== 'all'}
                        onClick={() => setIsFilterRowOpen(open => !open)}
                      />
                    )}
                  </Stack>
                </TableCell>

                <TableCell
                  sortDirection={getSortDirection('createdAt')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.publishedAt)}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <TableSortLabel
                      active={sortField === 'createdAt'}
                      direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                      onClick={() => handleSort('createdAt')}
                      hideSortIcon={forPrint}
                      sx={{
                        ...(forPrint && { pointerEvents: 'none' }),
                        ...(Boolean(columnFilters?.createdDate) &&
                          filteredColumnLabelSx),
                      }}
                    >
                      Создано
                    </TableSortLabel>

                    {showColumnFilters && columnFilters && (
                      <PublicationColumnFilterButton
                        title="Создано"
                        open={isFilterRowOpen}
                        active={Boolean(columnFilters.createdDate)}
                        onClick={() => setIsFilterRowOpen(open => !open)}
                      />
                    )}
                  </Stack>
                </TableCell>

                {forPrint && (
                  <TableCell
                    sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.link)}
                  >
                    Ссылка
                  </TableCell>
                )}

                <TableCell sx={mediaCellSx}>Медиа</TableCell>

                {!forPrint && (
                  <TableCell
                    sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.actions)}
                  />
                )}
              </TableRow>

              {showColumnFilters && columnFilters && isFilterRowOpen && (
                <TableRow className="print-no-print">
                  <TableCell
                    sx={filterCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.title)}
                  >
                    <Box onClick={event => event.stopPropagation()}>
                      <FilterAutocomplete
                        size="small"
                        variant="standard"
                        value={columnFilters.title.value}
                        options={columnFilters.title.options}
                        selectedOption={columnFilters.title.selectedOption}
                        placeholder={
                          columnFilters.title.placeholder ?? 'Все названия'
                        }
                        loading={columnFilters.title.loading}
                        minInputLength={columnFilters.title.minInputLength}
                        onSearch={columnFilters.title.onSearch}
                        onChange={columnFilters.title.onChange}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={filterCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.post)}
                  >
                    <Box onClick={event => event.stopPropagation()}>
                      <FilterAutocomplete
                        size="small"
                        variant="standard"
                        value={columnFilters.post.value}
                        options={columnFilters.post.options}
                        selectedOption={columnFilters.post.selectedOption}
                        placeholder={
                          columnFilters.post.placeholder ?? 'Все задачи'
                        }
                        loading={columnFilters.post.loading}
                        minInputLength={columnFilters.post.minInputLength}
                        onSearch={columnFilters.post.onSearch}
                        onChange={columnFilters.post.onChange}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={filterCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.platform)}
                  >
                    <Box onClick={event => event.stopPropagation()}>
                      <FilterAutocomplete
                        size="small"
                        variant="standard"
                        value={columnFilters.platform.value}
                        options={columnFilters.platform.options}
                        selectedOption={columnFilters.platform.selectedOption}
                        placeholder={
                          columnFilters.platform.placeholder ?? 'Все площадки'
                        }
                        onChange={columnFilters.platform.onChange}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={filterCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.executor)}
                  >
                    <Box onClick={event => event.stopPropagation()}>
                      <FilterAutocomplete
                        size="small"
                        variant="standard"
                        value={columnFilters.executor.value}
                        options={columnFilters.executor.options}
                        selectedOption={columnFilters.executor.selectedOption}
                        placeholder={
                          columnFilters.executor.placeholder ??
                          'Все исполнители'
                        }
                        loading={columnFilters.executor.loading}
                        minInputLength={columnFilters.executor.minInputLength}
                        onSearch={columnFilters.executor.onSearch}
                        onChange={columnFilters.executor.onChange}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={filterCellSx(
                      PUBLICATION_TABLE_COLUMN_WIDTHS.publishedAt,
                    )}
                  >
                    <ColumnDateFilter
                      value={columnFilters.createdDate}
                      placeholder="Все даты"
                      todayLabel="Создано сегодня"
                      onChange={columnFilters.onCreatedDateChange}
                    />
                  </TableCell>
                  {forPrint && (
                    <TableCell
                      sx={filterCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.link)}
                    />
                  )}
                  <TableCell sx={mediaCellSx} />
                  {!forPrint && (
                    <TableCell
                      sx={filterCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.actions)}
                    />
                  )}
                </TableRow>
              )}
            </TableHead>

            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    sx={{ py: 8, border: 0 }}
                  >
                    <EmptyBlock
                      title={
                        hasActiveColumnFilter
                          ? 'Ничего не найдено'
                          : emptyMessage
                      }
                      description={
                        hasActiveColumnFilter
                          ? 'Попробуйте изменить фильтры'
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
              visiblePublications.map(publication => {
                const participantUser = publication.executor
                  ? executorToUserPartial(publication.executor)
                  : (publication.owner as Partial<User>);
                const previewMedia = getPublicationPreviewMedia(
                  publication
                ) as TaskMedia[];
                const galleryMedia =
                  getPublicationGalleryMediaItems(publication);

                return (
                  <TableRow
                    key={publication.id}
                    hover={!forPrint}
                    onClick={
                      forPrint
                        ? undefined
                        : () => navigate(getPublicationTaskPath(publication))
                    }
                    sx={{
                      cursor: forPrint ? 'default' : 'pointer',
                      ...(!forPrint && {
                        '&:hover': { bgcolor: 'secondary.light' },
                      }),
                    }}
                  >
                    <TableCell
                      sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.title)}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getPublicationTitle(publication)}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.post)}
                      onClick={
                        forPrint
                          ? undefined
                          : event => {
                            event.stopPropagation();
                            navigate(getPublicationPostPath(publication));
                          }
                      }
                    >
                      <Typography
                        variant="body2"
                        color={forPrint ? 'text.primary' : 'info.main'}
                        sx={{
                          transition: 'color 0.2s ease-in-out',
                          ...(forPrint
                            ? undefined
                            : { '&:hover': { color: 'primary.main' } }),
                        }}
                      >
                        {getPublicationPostTitle(publication)}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={columnCellSx(
                        PUBLICATION_TABLE_COLUMN_WIDTHS.platform
                      )}
                    >
                      {(() => {
                        const platforms = getPublicationPlatforms(publication);

                        if (!platforms.length) {
                          return (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              —
                            </Typography>
                          );
                        }

                        if (forPrint) {
                          return (
                            <Typography variant="body2">
                              {platforms.map(getPlatformLabel).join(', ')}
                            </Typography>
                          );
                        }

                        return (
                          <Tooltip
                            title={platforms.map(getPlatformLabel).join(', ')}
                          >
                            <Chip
                              size="small"
                              variant="outlined"
                              label={platforms.length}
                            />
                          </Tooltip>
                        );
                      })()}
                    </TableCell>

                    <TableCell
                      sx={columnCellSx(
                        PUBLICATION_TABLE_COLUMN_WIDTHS.executor
                      )}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', minWidth: 0 }}
                      >
                        {!forPrint && (
                          <Avatar
                            src={
                              publication.executor?.avatar ??
                              publication.owner.avatar ??
                              ''
                            }
                            sx={{ width: 28, height: 28 }}
                          />
                        )}
                        <UserDisplayName
                          user={participantUser}
                          variant="body2"
                          withBadges={false}
                        />
                      </Stack>
                    </TableCell>

                    <TableCell
                      sx={columnCellSx(
                        PUBLICATION_TABLE_COLUMN_WIDTHS.publishedAt
                      )}
                    >
                      <Typography
                        variant={forPrint ? 'body2' : 'caption'}
                        color={forPrint ? 'text.primary' : 'text.secondary'}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {forPrint
                          ? format(
                            new Date(publication.createdAt),
                            'dd.MM.yyyy HH:mm',
                            { locale: ru }
                          )
                          : formatDistanceToNow(
                            new Date(publication.createdAt),
                            {
                              addSuffix: true,
                              locale: ru,
                            }
                          )}
                      </Typography>
                      {!forPrint && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block', whiteSpace: 'nowrap' }}
                        >
                          {format(
                            new Date(publication.createdAt),
                            'dd.MM.yyyy',
                            {
                              locale: ru,
                            }
                          )}
                        </Typography>
                      )}
                    </TableCell>

                    {forPrint && (
                      <TableCell
                        sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.link)}
                      >
                        {publicationHasLink(publication) ? (
                          <CheckBox
                            fontSize="small"
                            color="primary"
                            aria-label="Ссылка прикреплена"
                          />
                        ) : (
                          <CheckBoxOutlineBlank
                            fontSize="small"
                            color="disabled"
                            aria-label="Ссылка не прикреплена"
                          />
                        )}
                      </TableCell>
                    )}

                    <TableCell sx={mediaCellSx}>
                      {previewMedia.length > 0 ? (
                        forPrint ? (
                          <Typography variant="body2">
                            {previewMedia.length}
                          </Typography>
                        ) : (
                          <Box
                            onClick={event =>
                              handleOpenGallery(event, galleryMedia)
                            }
                            onMouseDown={event => event.stopPropagation()}
                            sx={{
                              width: 'fit-content',
                              cursor: 'zoom-in',
                            }}
                          >
                            <MediaPreview media={previewMedia} />
                          </Box>
                        )
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {!forPrint && (
                      <TableCell
                        sx={columnCellSx(
                          PUBLICATION_TABLE_COLUMN_WIDTHS.actions
                        )}
                        onClick={event => event.stopPropagation()}
                        onMouseDown={event => event.stopPropagation()}
                      >
                        <Tooltip
                          title={
                            publicationHasLink(publication)
                              ? 'Ссылки публикации'
                              : 'Прикрепить ссылку'
                          }
                        >
                          <IconButton
                            size="small"
                            aria-label={
                              publicationHasLink(publication)
                                ? 'Ссылки публикации'
                                : 'Прикрепить ссылку'
                            }
                            onClick={event =>
                              setLinkMenu({
                                anchor: event.currentTarget,
                                publication,
                              })
                            }
                          >
                            {publicationHasLink(publication) ? (
                              <OpenInNewOutlined fontSize="small" />
                            ) : (
                              <LinkOutlined fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {showPagination && (
          <TablePagination
            component="div"
            page={currentPage}
            count={paginationCount}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            rowsPerPageOptions={[rowsPerPage]}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} из ${count}`
            }
            sx={{
              flexShrink: 0,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          />
        )}
      </Box>

      {!forPrint && (
        <FullScreenGallery
          isMobile={isMobile}
          items={galleryItems ?? []}
          isOpen={Boolean(galleryItems?.length)}
          onClose={() => setGalleryItems(null)}
        />
      )}

      {!forPrint && (
        <>
          <Menu
            anchorEl={linkMenu?.anchor ?? null}
            open={Boolean(linkMenu)}
            onClose={() => setLinkMenu(null)}
          >
            {linkMenu &&
              (() => {
                const platforms = getPublicationPlatforms(
                  linkMenu.publication,
                );
                const resolvedPlatforms: Platform[] =
                  platforms.length > 0 ? platforms : ['OTHER'];
                const links = getPublicationPlatformLinks(
                  linkMenu.publication,
                );

                return (
                  <>
                    {resolvedPlatforms.map(platform => {
                      const url = links[platform];
                      if (url) {
                        return (
                          <MenuItem
                            key={platform}
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setLinkMenu(null)}
                          >
                            <ListItemIcon>
                              <OpenInNewOutlined fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                              Открыть · {getPlatformLabel(platform)}
                            </ListItemText>
                          </MenuItem>
                        );
                      }

                      return (
                        <MenuItem
                          key={platform}
                          onClick={() => {
                            setAttachLinkPublication(linkMenu.publication);
                            setLinkMenu(null);
                          }}
                        >
                          <ListItemIcon>
                            <LinkOutlined fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>
                            Прикрепить · {getPlatformLabel(platform)}
                          </ListItemText>
                        </MenuItem>
                      );
                    })}
                    <MenuItem
                      onClick={() => {
                        setAttachLinkPublication(linkMenu.publication);
                        setLinkMenu(null);
                      }}
                    >
                      <ListItemIcon>
                        <LinkOutlined fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Изменить ссылки</ListItemText>
                    </MenuItem>
                  </>
                );
              })()}
          </Menu>

          <AttachPublicationLinkDialog
            open={Boolean(attachLinkPublication)}
            publication={attachLinkPublication}
            onClose={() => setAttachLinkPublication(null)}
          />
        </>
      )}
    </>
  );
};

export default PublicationTable;
