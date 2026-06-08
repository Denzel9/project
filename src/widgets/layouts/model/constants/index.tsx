import {
  PersonOutlined,
  BuildOutlined,
  NotificationsNoneOutlined,
  LanguageOutlined,
  PeopleOutlined,
} from '@mui/icons-material';

import { ROUTES } from '@/shared/config/routes';

import type { SettingsMenuSection } from '@/pages/settings/model/types';

export const SETTINGS_MENU_SECTIONS: SettingsMenuSection[] = [
  {
    title: 'Основные настройки',
    items: [
      {
        label: 'Аккаунт',
        path: ROUTES.SETTINGS_ACCOUNT,
        icon: <PersonOutlined fontSize="small" />,
      },
      {
        label: 'Уведомления',
        path: ROUTES.SETTINGS_NOTIFICATION,
        icon: <NotificationsNoneOutlined fontSize="small" />,
      },
    ],
  },
  {
    title: 'Настройки рабочего пространства',
    items: [
      {
        label: 'Общие',
        path: ROUTES.SETTINGS_GENERAL,
        icon: <BuildOutlined fontSize="small" />,
      },
      {
        label: 'Участники',
        path: ROUTES.SETTINGS_MEMBERS,
        icon: <PeopleOutlined fontSize="small" />,
      },
      {
        label: 'Платежи',
        path: ROUTES.SETTINGS_BILLING,
        icon: <LanguageOutlined fontSize="small" />,
      },
    ],
  },
];
