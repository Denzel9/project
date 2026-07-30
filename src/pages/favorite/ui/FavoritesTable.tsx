import { FavoriteBorder } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import {
  getFavoriteUserName,
  useRemoveFavoriteMutation,
  useRemoveFavoriteUserMutation,
  type FavoritePostItem,
  type FavoriteType,
  type FavoriteUserItem,
} from '@/entities/favorite'
import { UserDisplayName, type User } from '@/entities/user'
import { ROUTES, getYandexMapsUrl, scrollMainToTop } from '@/shared'

import {
  FAVORITE_POST_TABLE_COLUMN_WIDTHS,
  FAVORITE_TABLE_PAGE_SIZE,
  FAVORITE_USER_TABLE_COLUMN_WIDTHS,
} from '../model/constants'
import { sortFavoritePosts, sortFavoriteUsers } from '../model/utils'

import type {
  FavoritePostSortField,
  FavoriteSortOrder,
  FavoriteUserSortField,
} from '../model/types'

type FavoritesTableProps = {
  favoriteType: FavoriteType
  postItems?: FavoritePostItem[]
  userItems?: FavoriteUserItem[]
  total?: number
  page?: number
  forPrint?: boolean
  paginated?: boolean
  serverPagination?: boolean
  rowsPerPage?: number
  onPageChange?: (event: unknown, nextPage: number) => void
}

export const FavoritesTable = ({
  favoriteType,
  postItems = [],
  userItems = [],
  total,
  page: controlledPage,
  forPrint = false,
  paginated = true,
  serverPagination = false,
  rowsPerPage = FAVORITE_TABLE_PAGE_SIZE,
  onPageChange,
}: FavoritesTableProps) => {
  const navigate = useNavigate()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const [internalPage, setInternalPage] = useState(0)
  const [sortOrder, setSortOrder] = useState<FavoriteSortOrder>('desc')
  const [postSortField, setPostSortField] =
    useState<FavoritePostSortField>('savedAt')
  const [userSortField, setUserSortField] =
    useState<FavoriteUserSortField>('savedAt')

  const { mutate: removePost, isPending: isRemovingPost } =
    useRemoveFavoriteMutation()
  const { mutate: removeUser, isPending: isRemovingUser } =
    useRemoveFavoriteUserMutation()

  const isControlledPagination =
    controlledPage !== undefined && onPageChange !== undefined
  const page = isControlledPagination ? controlledPage : internalPage
  const isPostType = favoriteType === 'POST'

  const sortedPosts = useMemo(
    () => sortFavoritePosts(postItems, postSortField, sortOrder),
    [postItems, postSortField, sortOrder]
  )

  const sortedUsers = useMemo(
    () => sortFavoriteUsers(userItems, userSortField, sortOrder),
    [userItems, userSortField, sortOrder]
  )

  const sortedCount = isPostType ? sortedPosts.length : sortedUsers.length
  const paginationCount = serverPagination ? (total ?? sortedCount) : sortedCount
  const pageCount = Math.max(1, Math.ceil(paginationCount / rowsPerPage))
  const currentPage = Math.min(page, pageCount - 1)

  const visiblePosts = useMemo(() => {
    if (!paginated || serverPagination) return sortedPosts
    const start = currentPage * rowsPerPage
    return sortedPosts.slice(start, start + rowsPerPage)
  }, [sortedPosts, paginated, serverPagination, currentPage, rowsPerPage])

  const visibleUsers = useMemo(() => {
    if (!paginated || serverPagination) return sortedUsers
    const start = currentPage * rowsPerPage
    return sortedUsers.slice(start, start + rowsPerPage)
  }, [sortedUsers, paginated, serverPagination, currentPage, rowsPerPage])

  const showPagination = paginated && !forPrint && paginationCount > 0

  const scrollTableToTop = () => {
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    if (!forPrint) scrollMainToTop('smooth')
  }

  const handlePageChange = (event: unknown, nextPage: number) => {
    if (isControlledPagination) {
      onPageChange(event, nextPage)
      scrollTableToTop()
      return
    }
    setInternalPage(nextPage)
    scrollTableToTop()
  }

  const resetPage = () => {
    if (isControlledPagination) onPageChange?.(null, 0)
    else setInternalPage(0)
  }

  const handlePostSort = (field: FavoritePostSortField) => {
    if (forPrint) return
    if (postSortField === field) {
      setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setPostSortField(field)
    resetPage()
    setSortOrder(field === 'savedAt' ? 'desc' : 'asc')
  }

  const handleUserSort = (field: FavoriteUserSortField) => {
    if (forPrint) return
    if (userSortField === field) {
      setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setUserSortField(field)
    resetPage()
    setSortOrder(
      field === 'savedAt' ||
        field === 'followers' ||
        field === 'completedTasksCount'
        ? 'desc'
        : 'asc'
    )
  }

  const columnCellSx = (width: string | number) => ({
    p: 3,
    width,
    maxWidth: width,
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  })

  return (
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
          flex: 1,
          minHeight: 0,
          ...(forPrint && { overflow: 'visible' }),
        }}
      >
        <Table stickyHeader={!forPrint}>
          {isPostType ? (
            <>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={columnCellSx(FAVORITE_POST_TABLE_COLUMN_WIDTHS.title)}
                  >
                    <TableSortLabel
                      active={postSortField === 'title'}
                      direction={
                        postSortField === 'title' ? sortOrder : 'asc'
                      }
                      onClick={() => handlePostSort('title')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      Объявление
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={columnCellSx(FAVORITE_POST_TABLE_COLUMN_WIDTHS.owner)}
                  >
                    <TableSortLabel
                      active={postSortField === 'owner'}
                      direction={
                        postSortField === 'owner' ? sortOrder : 'asc'
                      }
                      onClick={() => handlePostSort('owner')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      Владелец
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={columnCellSx(FAVORITE_POST_TABLE_COLUMN_WIDTHS.group)}
                  >
                    <TableSortLabel
                      active={postSortField === 'group'}
                      direction={
                        postSortField === 'group' ? sortOrder : 'asc'
                      }
                      onClick={() => handlePostSort('group')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      Подборка
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={columnCellSx(FAVORITE_POST_TABLE_COLUMN_WIDTHS.savedAt)}
                  >
                    <TableSortLabel
                      active={postSortField === 'savedAt'}
                      direction={
                        postSortField === 'savedAt' ? sortOrder : 'asc'
                      }
                      onClick={() => handlePostSort('savedAt')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      Добавлено
                    </TableSortLabel>
                  </TableCell>
                  {!forPrint && (
                    <TableCell
                      sx={columnCellSx(
                        FAVORITE_POST_TABLE_COLUMN_WIDTHS.actions
                      )}
                    >
                      Действия
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {visiblePosts.map(item => (
                  <TableRow
                    key={item.postId}
                    hover={!forPrint}
                    sx={{ cursor: forPrint ? 'default' : 'pointer' }}
                    onClick={() => {
                      if (!forPrint) navigate(`${ROUTES.POST}/${item.postId}`)
                    }}
                  >
                    <TableCell
                      sx={columnCellSx(FAVORITE_POST_TABLE_COLUMN_WIDTHS.title)}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', minWidth: 0 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.post.title}
                        </Typography>
                        {item.post.urgent && (
                          <Chip
                            size="small"
                            color="error"
                            label="Срочно"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={columnCellSx(FAVORITE_POST_TABLE_COLUMN_WIDTHS.owner)}
                    >
                      <UserDisplayName
                        user={item.post.owner as Partial<User>}
                        variant="body2"
                      />
                    </TableCell>
                    <TableCell
                      sx={columnCellSx(FAVORITE_POST_TABLE_COLUMN_WIDTHS.group)}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.groupName || 'Без подборки'}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={columnCellSx(
                        FAVORITE_POST_TABLE_COLUMN_WIDTHS.savedAt
                      )}
                    >
                      <Typography variant="body2">
                        {format(new Date(item.savedAt), 'dd MMM yyyy', {
                          locale: ru,
                        })}
                      </Typography>
                    </TableCell>
                    {!forPrint && (
                      <TableCell
                        sx={columnCellSx(
                          FAVORITE_POST_TABLE_COLUMN_WIDTHS.actions
                        )}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isRemovingPost}
                          onClick={event => {
                            event.stopPropagation()
                            removePost(item.postId)
                          }}
                        >
                          <FavoriteBorder fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </>
          ) : (
            <>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={columnCellSx(FAVORITE_USER_TABLE_COLUMN_WIDTHS.name)}
                  >
                    <TableSortLabel
                      active={userSortField === 'name'}
                      direction={userSortField === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleUserSort('name')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      {favoriteType === 'COMPANY' ? 'Компания' : 'Креатор'}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={columnCellSx(
                      FAVORITE_USER_TABLE_COLUMN_WIDTHS.location
                    )}
                  >
                    <TableSortLabel
                      active={userSortField === 'location'}
                      direction={
                        userSortField === 'location' ? sortOrder : 'asc'
                      }
                      onClick={() => handleUserSort('location')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      Локация
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={columnCellSx(
                      FAVORITE_USER_TABLE_COLUMN_WIDTHS.followers
                    )}
                  >
                    <TableSortLabel
                      active={userSortField === 'followers'}
                      direction={
                        userSortField === 'followers' ? sortOrder : 'asc'
                      }
                      onClick={() => handleUserSort('followers')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      В избранном
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={columnCellSx(
                      FAVORITE_USER_TABLE_COLUMN_WIDTHS.completedTasksCount
                    )}
                  >
                    <TableSortLabel
                      active={userSortField === 'completedTasksCount'}
                      direction={
                        userSortField === 'completedTasksCount'
                          ? sortOrder
                          : 'asc'
                      }
                      onClick={() => handleUserSort('completedTasksCount')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      Работы
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={columnCellSx(FAVORITE_USER_TABLE_COLUMN_WIDTHS.savedAt)}
                  >
                    <TableSortLabel
                      active={userSortField === 'savedAt'}
                      direction={
                        userSortField === 'savedAt' ? sortOrder : 'asc'
                      }
                      onClick={() => handleUserSort('savedAt')}
                      hideSortIcon={forPrint}
                      sx={forPrint ? { pointerEvents: 'none' } : undefined}
                    >
                      Добавлено
                    </TableSortLabel>
                  </TableCell>
                  {!forPrint && (
                    <TableCell
                      sx={columnCellSx(
                        FAVORITE_USER_TABLE_COLUMN_WIDTHS.actions
                      )}
                    >
                      Действия
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUsers.map(item => (
                  <TableRow
                    key={item.userId}
                    hover={!forPrint}
                    sx={{ cursor: forPrint ? 'default' : 'pointer' }}
                    onClick={() => {
                      if (!forPrint) {
                        navigate(`${ROUTES.PROFILE}?userId=${item.userId}`)
                      }
                    }}
                  >
                    <TableCell
                      sx={columnCellSx(FAVORITE_USER_TABLE_COLUMN_WIDTHS.name)}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        sx={{ alignItems: 'center', minWidth: 0 }}
                      >
                        <Avatar
                          src={item.user.avatar ?? undefined}
                          sx={{ width: 36, height: 36, flexShrink: 0 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                          noWrap
                        >
                          {getFavoriteUserName(item.user)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={columnCellSx(
                        FAVORITE_USER_TABLE_COLUMN_WIDTHS.location
                      )}
                    >
                      {item.user.location ? (
                        <Link
                          href={getYandexMapsUrl(item.user.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {item.user.location}
                        </Link>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      sx={columnCellSx(
                        FAVORITE_USER_TABLE_COLUMN_WIDTHS.followers
                      )}
                    >
                      <Typography variant="body2">
                        {item.user.followers ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={columnCellSx(
                        FAVORITE_USER_TABLE_COLUMN_WIDTHS.completedTasksCount
                      )}
                    >
                      <Typography variant="body2">
                        {item.user.completedTasksCount ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={columnCellSx(
                        FAVORITE_USER_TABLE_COLUMN_WIDTHS.savedAt
                      )}
                    >
                      <Typography variant="body2">
                        {format(new Date(item.savedAt), 'dd MMM yyyy', {
                          locale: ru,
                        })}
                      </Typography>
                    </TableCell>
                    {!forPrint && (
                      <TableCell
                        sx={columnCellSx(
                          FAVORITE_USER_TABLE_COLUMN_WIDTHS.actions
                        )}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isRemovingUser}
                          onClick={event => {
                            event.stopPropagation()
                            removeUser(item.userId)
                          }}
                        >
                          <FavoriteBorder fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>

      {showPagination && (
        <TablePagination
          component="div"
          page={currentPage}
          count={paginationCount}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
          onPageChange={handlePageChange}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} из ${count !== -1 ? count : `больше чем ${to}`}`
          }
          sx={{
            borderTop: theme => `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  )
}
