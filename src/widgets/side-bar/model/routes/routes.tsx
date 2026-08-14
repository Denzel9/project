import {
  HomeOutlined,
  FavoriteBorderOutlined,
  ChatOutlined,
  TopicOutlined,
  SettingsOutlined,
  PersonOutlined,
  PostAddOutlined,
  CalendarMonthOutlined,
  DashboardOutlined,
  TaskOutlined,
  PeopleOutlined,
  ImageOutlined,
  Inventory2Outlined,
  ContentCopyOutlined,
} from '@mui/icons-material';

import { ROUTES } from '@/shared/config/routes';

import type { MenuRoute } from '../types/types';

export const AUTH_TYPES = {
  ONLY_AUTH: 'only_auth',
  ALWAYS: 'always',
  COMPANY: 'company',
  CREATOR: 'creator',
  MANAGER: 'manager',
  MARKETPLACE: 'marketplace',
} as const;

export const TOP_MENU_ROUTES: MenuRoute[] = [
  {
    authTypes: [AUTH_TYPES.ALWAYS],
    path: ROUTES.INDEX,
    icon: <HomeOutlined />,
    label: 'Главная',
  },
  {
    authTypes: [AUTH_TYPES.ALWAYS, AUTH_TYPES.MARKETPLACE],
    path: ROUTES.CHATS,
    icon: <ChatOutlined />,
    label: 'Чат',
    badgeKey: 'chat',
  },
  {
    authTypes: [AUTH_TYPES.ALWAYS, AUTH_TYPES.MARKETPLACE],
    path: ROUTES.FAVORITES,
    icon: <FavoriteBorderOutlined />,
    label: 'Избранное',
  },
  {
    authTypes: [AUTH_TYPES.CREATOR, AUTH_TYPES.ALWAYS],
    path: ROUTES.MY_RESPONSES,
    icon: <TopicOutlined />,
    label: 'Отклики',
    badgeKey: 'applications',
  },
  {
    authTypes: [AUTH_TYPES.COMPANY, AUTH_TYPES.ALWAYS],
    path: ROUTES.POSTS_RESPONSES,
    icon: <PostAddOutlined />,
    label: 'Отклики',
    badgeKey: 'applications',
  },
  {
    authTypes: [AUTH_TYPES.COMPANY],
    path: ROUTES.MY_ANNOUNCEMENTS,
    icon: <ImageOutlined />,
    label: 'Мои объявления',
  },
];

export const CRM_MENU_ITEMS: MenuRoute[] = [
  {
    label: 'Дашборд',
    path: ROUTES.CRM,
    icon: <DashboardOutlined />,
  },
  {
    label: 'Мои задачи',
    path: ROUTES.MY_TASKS,
    icon: <TaskOutlined />,
    badgeKey: 'tasks',
  },
  {
    label: 'Календарь',
    path: ROUTES.CALENDAR,
    icon: <CalendarMonthOutlined />,
  },
  {
    label: 'Исполнители',
    path: ROUTES.EXECUTORS,
    icon: <PeopleOutlined />,
    authTypes: [AUTH_TYPES.COMPANY],
  },
  {
    label: 'Компании',
    path: ROUTES.EXECUTORS,
    icon: <PeopleOutlined />,
    authTypes: [AUTH_TYPES.CREATOR],
  },
  {
    label: 'Публикации',
    path: ROUTES.PUBLICATIONS,
    icon: <ImageOutlined />,
  },
  {
    label: 'Архив',
    path: ROUTES.ARCHIVE,
    icon: <Inventory2Outlined />,
  },
  {
    label: 'Шаблоны',
    path: ROUTES.TEMPLATES,
    icon: <ContentCopyOutlined />,
  },
];

export const BOTTOM_MENU_ROUTES: MenuRoute[] = [
  {
    authTypes: [AUTH_TYPES.ONLY_AUTH, AUTH_TYPES.MARKETPLACE],
    path: ROUTES.PROFILE,
    icon: <PersonOutlined />,
    label: 'Профиль',
  },
  {
    authTypes: [AUTH_TYPES.ALWAYS],
    path: ROUTES.SETTINGS,
    icon: <SettingsOutlined />,
    label: 'Настройки',
  },
];
