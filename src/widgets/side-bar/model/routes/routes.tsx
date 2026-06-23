import {
  HomeOutlined,
  FavoriteBorderOutlined,
  ChatOutlined,
  DashboardOutlined,
  TopicOutlined,
  SettingsOutlined,
  PersonOutlined,
  TaskOutlined,
  PostAddOutlined,
} from '@mui/icons-material';

import { ROUTES } from '@/shared/config/routes';

import type { MenuRoute } from '../types/types';

export const AUTH_TYPES = {
  ONLY_AUTH: 'only_auth',
  ALWAYS: 'always',
  COMPANY: 'company',
  CREATOR: 'creator',
} as const;

export const TOP_MENU_ROUTES: MenuRoute[] = [
  {
    authTypes: [AUTH_TYPES.ALWAYS],
    path: ROUTES.INDEX,
    icon: <HomeOutlined />,
    label: 'Главная',
  },
  {
    authTypes: [AUTH_TYPES.ALWAYS],
    path: ROUTES.CHAT,
    icon: <ChatOutlined />,
    label: 'Чат',
  },
  {
    authTypes: [AUTH_TYPES.ALWAYS],
    path: ROUTES.FAVORITES,
    icon: <FavoriteBorderOutlined />,
    label: 'Избранное',
  },
  {
    authTypes: [AUTH_TYPES.CREATOR, AUTH_TYPES.ALWAYS],
    path: ROUTES.MY_RESPONSES,
    icon: <TopicOutlined />,
    label: 'Отклики',
  },
  {
    authTypes: [AUTH_TYPES.ALWAYS],
    path: ROUTES.MY_TASKS,
    icon: <TaskOutlined />,
    label: 'Мои задачи',
  },
  {
    authTypes: [AUTH_TYPES.COMPANY, AUTH_TYPES.ALWAYS],
    path: ROUTES.MANAGE_POSTS,
    icon: <PostAddOutlined />,
    label: 'Отклики',
  },
];

export const MENU_ROUTES_PRIME: MenuRoute[] = [
  {
    authTypes: [AUTH_TYPES.ONLY_AUTH],
    path: ROUTES.CRM,
    icon: <DashboardOutlined />,
    label: 'CRM',
  },
];

export const BOTTOM_MENU_ROUTES: MenuRoute[] = [
  {
    authTypes: [AUTH_TYPES.ONLY_AUTH],
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
