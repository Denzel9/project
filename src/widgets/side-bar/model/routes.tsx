import {
  HomeOutlined,
  FavoriteBorderOutlined,
  ChatOutlined,
  DashboardOutlined,
  TopicOutlined,
  SettingsOutlined,
  PersonOutlined,
  TaskOutlined,
} from '@mui/icons-material';

import { ROUTES } from '@/shared/config/routes';

import type { MenuRoute } from './types';

export const AUTH_TYPES = {
  ONLY_AUTH: 'only_auth',
  ALWAYS: 'always',
} as const;

export const TOP_MENU_ROUTES: MenuRoute[] = [
  {
    authType: AUTH_TYPES.ALWAYS,
    path: ROUTES.INDEX,
    icon: <HomeOutlined />,
    label: 'Главная',
  },
  {
    authType: AUTH_TYPES.ALWAYS,
    path: ROUTES.CHAT,
    icon: <ChatOutlined />,
    label: 'Чат',
  },
  {
    authType: AUTH_TYPES.ALWAYS,
    path: ROUTES.FAVORITES,
    icon: <FavoriteBorderOutlined />,
    label: 'Избранное',
  },
  {
    authType: AUTH_TYPES.ALWAYS,
    path: ROUTES.MY_RESPONSES,
    icon: <TopicOutlined />,
    label: 'Мои отклики',
  },
  {
    authType: AUTH_TYPES.ALWAYS,
    path: ROUTES.MY_TASKS,
    icon: <TaskOutlined />,
    label: 'Мои задачи',
  },
];

export const MENU_ROUTES_PRIME: MenuRoute[] = [
  {
    authType: AUTH_TYPES.ONLY_AUTH,
    path: ROUTES.CRM,
    icon: <DashboardOutlined />,
    label: 'CRM',
  },
];

export const BOTTOM_MENU_ROUTES: MenuRoute[] = [
  {
    authType: AUTH_TYPES.ONLY_AUTH,
    path: ROUTES.PROFILE,
    icon: <PersonOutlined />,
    label: 'Профиль',
  },
  {
    authType: AUTH_TYPES.ALWAYS,
    path: ROUTES.SETTINGS,
    icon: <SettingsOutlined />,
    label: 'Настройки',
  },
];
