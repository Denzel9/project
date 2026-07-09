export type SupportChannel = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: 'telegram',
    label: 'Telegram',
    description: 'Напишите нам в Telegram',
    href: 'https://t.me/nikssens',
  },
  {
    id: 'max',
    label: 'MAX',
    description: 'Напишите нам в MAX',
    href: 'https://max.ru',
  },
  {
    id: 'email',
    label: 'support@nikssens.ru',
    description: 'Электронная почта',
    href: 'mailto:support@nikssens.ru',
  },
  {
    id: 'knowledge-base',
    label: 'База знаний',
    description: 'Ответы на частые вопросы',
    href: 'https://help.nikssens.ru',
  },
];
