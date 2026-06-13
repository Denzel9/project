import {
  PersonOutlined,
  BuildOutlined,
  NotificationsNoneOutlined,
  LanguageOutlined,
  PeopleOutlined,
  SecurityOutlined,
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
      {
        label: 'Безопасность',
        path: ROUTES.SETTINGS_SECURITY,
        icon: <SecurityOutlined fontSize="small" />,
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

export const CREATOR_PROFILE_KEYS = ['name', 'lastName'];

export const COMPANY_PROFILE_KEYS = ['companyName'];

export const MY_PARAMETERS_KEYS = [
  'height',
  'weight',
  'size',
  'birthday',
  'gender',
  'parameters',
];

export const SIZE_OPTIONS = [
  { label: 'XS', value: 'XS' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: 'XXL', value: 'XXL' },
];

export const GENDER_OPTIONS = [
  { label: 'Мужской', value: 'male' },
  { label: 'Женский', value: 'female' },
];
