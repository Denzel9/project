import { ROUTES } from '@/shared/config/routes';

const enc = (value: string) => encodeURIComponent(value);

export type ShareTarget = {
  id: string;
  label: string;
  getShareUrl: (url: string, title: string) => string;
};

export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: 'telegram',
    label: 'Telegram',
    getShareUrl: (url, title) =>
      `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    getShareUrl: (url, title) =>
      `https://wa.me/?text=${enc(`${title} ${url}`)}`,
  },
  {
    id: 'vk',
    label: 'ВКонтакте',
    getShareUrl: (url, title) =>
      `https://vk.com/share.php?url=${enc(url)}&title=${enc(title)}`,
  },
  {
    id: 'ok',
    label: 'Одноклассники',
    getShareUrl: (url, title) =>
      `https://connect.ok.ru/offer?url=${enc(url)}&title=${enc(title)}`,
  },
  {
    id: 'viber',
    label: 'Viber',
    getShareUrl: (url, title) =>
      `viber://forward?text=${enc(`${title} ${url}`)}`,
  },
];

export const getPostShareUrl = (postId: string) =>
  `${window.location.origin}${ROUTES.POST}/${postId}`;

export const openShareUrl = (url: string) =>
  window.open(url, '_blank', 'noopener,noreferrer');
