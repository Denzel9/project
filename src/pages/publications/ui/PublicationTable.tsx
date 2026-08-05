import { OpenInNewOutlined } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
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
import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { theme } from '@/app/index';
import { getPlatformLabel } from '@/entities/post';
import {
  executorToUserPartial,
  UserDisplayName,
  type User,
} from '@/entities/user';
import { scrollMainToTop } from '@/shared';
import { FullScreenGallery, MediaPreview } from '@/widgets';

import {
  PUBLICATION_TABLE_COLUMN_WIDTHS,
  PUBLICATION_TABLE_PAGE_SIZE,
} from '../model/constants';
import {
  getPublicationGalleryMediaItems,
  getPublicationPlatforms,
  getPublicationPostPath,
  getPublicationPostTitle,
  getPublicationPreviewMedia,
  getPublicationTaskPath,
  getPublicationTitle,
  sortPublications,
} from '../model/utils';

import type {
  PublicationSortField,
  PublicationSortOrder,
} from '../model/types';
import type { Publication } from '@/entities/publication';
import type { TaskMedia } from '@/entities/task';
import type { MediaItemType } from '@/widgets/media/model/types';

type PublicationTableProps = {
  publications: Publication[];
  total?: number;
  page?: number;
  forPrint?: boolean;
  paginated?: boolean;
  serverPagination?: boolean;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, nextPage: number) => void;
};

export const PublicationTable = ({
  publications,
  total,
  page: controlledPage,
  forPrint = false,
  paginated = true,
  serverPagination = false,
  rowsPerPage = PUBLICATION_TABLE_PAGE_SIZE,
  onPageChange,
}: PublicationTableProps) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [galleryItems, setGalleryItems] = useState<MediaItemType[] | null>(
    null
  );
  const [internalPage, setInternalPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<PublicationSortOrder>('desc');
  const [sortField, setSortField] = useState<PublicationSortField>('createdAt');

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

  const showPagination =
    paginated &&
    !forPrint &&
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
          bgcolor: 'white',
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
              }),
          }}
        >
          <Table
            stickyHeader={!forPrint}
            sx={{ tableLayout: 'fixed', width: '100%' }}
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
              {!forPrint && (
                <col
                  style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.actions }}
                />
              )}
              <col style={{ width: PUBLICATION_TABLE_COLUMN_WIDTHS.media }} />
            </colgroup>

            <TableHead>
              <TableRow>
                <TableCell
                  sortDirection={getSortDirection('title')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.title)}
                >
                  <TableSortLabel
                    active={sortField === 'title'}
                    direction={sortField === 'title' ? sortOrder : 'asc'}
                    onClick={() => handleSort('title')}
                    hideSortIcon={forPrint}
                    sx={forPrint ? { pointerEvents: 'none' } : undefined}
                  >
                    Название
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sortDirection={getSortDirection('post')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.post)}
                >
                  <TableSortLabel
                    active={sortField === 'post'}
                    direction={sortField === 'post' ? sortOrder : 'asc'}
                    onClick={() => handleSort('post')}
                    hideSortIcon={forPrint}
                    sx={forPrint ? { pointerEvents: 'none' } : undefined}
                  >
                    Пост
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sortDirection={getSortDirection('platform')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.platform)}
                >
                  <TableSortLabel
                    active={sortField === 'platform'}
                    direction={sortField === 'platform' ? sortOrder : 'asc'}
                    onClick={() => handleSort('platform')}
                    hideSortIcon={forPrint}
                    sx={forPrint ? { pointerEvents: 'none' } : undefined}
                  >
                    Площадки
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sortDirection={getSortDirection('executor')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.executor)}
                >
                  <TableSortLabel
                    active={sortField === 'executor'}
                    direction={sortField === 'executor' ? sortOrder : 'asc'}
                    onClick={() => handleSort('executor')}
                    hideSortIcon={forPrint}
                    sx={forPrint ? { pointerEvents: 'none' } : undefined}
                  >
                    Исполнитель
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sortDirection={getSortDirection('createdAt')}
                  sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.publishedAt)}
                >
                  <TableSortLabel
                    active={sortField === 'createdAt'}
                    direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                    onClick={() => handleSort('createdAt')}
                    hideSortIcon={forPrint}
                    sx={forPrint ? { pointerEvents: 'none' } : undefined}
                  >
                    Создано
                  </TableSortLabel>
                </TableCell>

                {!forPrint && (
                  <TableCell
                    sx={columnCellSx(PUBLICATION_TABLE_COLUMN_WIDTHS.actions)}
                  />
                )}

                <TableCell sx={mediaCellSx}>Медиа</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visiblePublications.map(publication => {
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

                    {!forPrint && (
                      <TableCell
                        sx={columnCellSx(
                          PUBLICATION_TABLE_COLUMN_WIDTHS.actions
                        )}
                        onClick={event => event.stopPropagation()}
                        onMouseDown={event => event.stopPropagation()}
                      >
                        {publication.externalUrl ? (
                          <Tooltip title="Открыть публикацию">
                            <IconButton
                              size="small"
                              href={publication.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Открыть публикацию"
                            >
                              <OpenInNewOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
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
                  </TableRow>
                );
              })}
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
    </>
  );
};

export default PublicationTable;
