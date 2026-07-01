import { Notifications } from '@mui/icons-material';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState, type MouseEvent } from 'react';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Новый отклик на задачу',
    description: 'Иван Петров откликнулся на «Разработка лендинга»',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    title: 'Задача выполнена',
    description: '«Подготовка презентации» отмечена как выполненная',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    title: 'Новый комментарий',
    description: 'Мария Сидорова оставила комментарий в задаче «Аудит сайта»',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    title: 'Приглашение в задачу',
    description: 'Вас пригласили исполнителем в «Настройка CRM»',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
  },
  {
    id: '5',
    title: 'Дедлайн приближается',
    description: 'До срока выполнения «Сбор аналитики» осталось 2 дня',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    isRead: true,
  },
];

const formatRelativeTime = (createdAt: string) =>
  formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ru });

export const NotificationsMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const unreadCount = MOCK_NOTIFICATIONS.filter(item => !item.isRead).length;

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge
          badgeContent={unreadCount}
          color="primary"
        >
          <Notifications />
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
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1">Уведомления</Typography>
        </Box>

        <Divider />

        {MOCK_NOTIFICATIONS.length === 0 ? (
          <MenuItem disabled>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Нет уведомлений
            </Typography>
          </MenuItem>
        ) : (
          MOCK_NOTIFICATIONS.map(item => (
            <MenuItem
              key={item.id}
              onClick={handleClose}
              sx={{
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                py: 1.5,
                bgcolor: item.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">{item.title}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  {item.description}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  {formatRelativeTime(item.createdAt)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};
