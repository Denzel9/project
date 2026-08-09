import { ROUTES } from '@/shared';

export const FOOTER_BRAND = {
  name: 'Nikssens',
  tagline:
    'Платформа, где бренды находят исполнителей и ведут работу от объявления до результата',
} as const;

export const FOOTER_NAV_LINKS = [
  { label: 'Главная', path: ROUTES.CRM },
  { label: 'Мои задачи', path: ROUTES.MY_TASKS },
  { label: 'Публикации', path: ROUTES.PUBLICATIONS },
  { label: 'Избранное', path: ROUTES.FAVORITES },
  { label: 'Настройки', path: ROUTES.SETTINGS },
  { label: 'Профиль', path: ROUTES.PROFILE },
] as const;

export const FOOTER_LEGAL_LINKS = [
  {
    label: 'Политика конфиденциальности',
    path: ROUTES.PRIVACY_POLICY,
  },
  {
    label: 'Пользовательское соглашение',
    path: ROUTES.USER_AGREEMENT,
  },
] as const;

export const FOOTER_CONTACT_ITEMS = [
  {
    label: 'Email',
    value: 'hello@nikssens.com',
    href: 'mailto:hello@nikssens.com',
  },
  {
    label: 'Телефон',
    value: '+7 (999) 000-00-00',
    href: 'tel:+79990000000',
  },
] as const;

export const FOOTER_SOCIAL_LINKS = [
  {
    id: 'telegram' as const,
    label: 'Telegram',
    href: 'https://t.me/nikssens',
  },
  {
    id: 'vk' as const,
    label: 'VK',
    href: 'https://vk.com/nikssens',
  },
  {
    id: 'instagram' as const,
    label: 'Instagram',
    href: 'https://instagram.com/nikssens',
  },
  {
    id: 'youtube' as const,
    label: 'YouTube',
    href: 'https://youtube.com/@nikssens',
  },
] as const;

export const footerLinkSx = {
  fontSize: 15,
  color: 'info.main',
  '&:hover': { color: 'primary.main' },
} as const;

export type FooterSocialId = (typeof FOOTER_SOCIAL_LINKS)[number]['id'];
