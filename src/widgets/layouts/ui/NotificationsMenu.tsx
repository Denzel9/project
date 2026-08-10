import { NotificationsNoneOutlined } from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import {
  getNotificationActorName,
  getNotificationLink,
  isNotificationUnread,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsInfiniteQuery,
  useNotificationsUnreadCountQuery,
} from '@/entities/notification';
import { useAuthStore } from '@/features/auth';

const NOTIFICATIONS_MENU_LIMIT = 20;

const formatRelativeTime = (createdAt: string) =>
  formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ru });

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const isAuth = useAuthStore(state => state.isAuth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: unreadCountData } = useNotificationsUnreadCountQuery({
    enabled: isAuth,
  });

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useNotificationsInfiniteQuery(
      { limit: NOTIFICATIONS_MENU_LIMIT },
      { enabled: isAuth && open }
    );

  const { mutate: markRead } = useMarkNotificationReadMutation();
  const { mutate: markAllRead, isPending: isMarkingAllRead } =
    useMarkAllNotificationsReadMutation();

  const notifications = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const unreadCount = unreadCountData?.count ?? 0;

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: string) => {
    const notification = notifications.find(item => item.id === notificationId);
    if (!notification) {
      handleClose();
      return;
    }

    if (isNotificationUnread(notification)) {
      markRead(notification.id);
    }

    const link = getNotificationLink(notification);
    handleClose();

    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllRead = () => {
    if (!unreadCount) return;
    markAllRead();
  };

  if (!isAuth) {
    return null;
  }

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ mr: '16px !important' }}>
        <Badge
          badgeContent={unreadCount}
          color="primary"
          max={99}
        >
          <NotificationsNoneOutlined />
        </Badge>
      </IconButton>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 420,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Stack
          direction="row"
          sx={{
            px: 2,
            py: 1.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1">Уведомления</Typography>

          {unreadCount > 0 && (
            <Button
              size="small"
              disabled={isMarkingAllRead}
              onClick={handleMarkAllRead}
              sx={{ px: 2 }}
            >
              Прочитать все
            </Button>
          )}
        </Stack>

        <Divider />

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <MenuItem disabled>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Нет уведомлений
              </Typography>
            </MenuItem>
          ) : (
            notifications.map(item => {
              const actorName = getNotificationActorName(item);
              const isUnread = isNotificationUnread(item);

              return (
                <MenuItem
                  key={item.id}
                  onClick={() => handleNotificationClick(item.id)}
                  sx={{
                    alignItems: 'flex-start',
                    whiteSpace: 'normal',
                    py: 1.5,
                    gap: 1.5,
                    bgcolor: isUnread ? 'action.hover' : 'transparent',
                  }}
                >
                  {item.actor?.avatar ? (
                    <Avatar
                      src={item.actor.avatar}
                      sx={{ width: 32, height: 32, mt: 0.25 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, mt: 0.25 }}>
                      {actorName.charAt(0) || '?'}
                    </Avatar>
                  )}

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2">{item.title}</Typography>

                    {item.body && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 0.25,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.body}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      {formatRelativeTime(item.createdAt)}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })
          )}

          {hasNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <Button
                size="small"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage ? 'Загрузка…' : 'Показать ещё'}
              </Button>
            </Box>
          )}
        </Box>
      </Menu>
    </>
  );
};
