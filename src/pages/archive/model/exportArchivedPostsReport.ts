import { format, isValid } from 'date-fns';

import type { Post } from '@/entities/post';
import { downloadCsv } from '@/shared/lib/export';

const formatExportDateTime = (value?: string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  if (!isValid(date)) return '—';

  return format(date, 'dd.MM.yyyy HH:mm');
};

const formatExportDate = (value?: string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  if (!isValid(date)) return '—';

  return format(date, 'dd.MM.yyyy');
};

const buildExportFilename = () => {
  const date = format(new Date(), 'yyyy-MM-dd');

  return `arxiv_posty_${date}.csv`;
};

export const exportArchivedPostsReport = (posts: Post[]) => {
  const headers = [
    'Название',
    'Срочный',
    'Приватный',
    'Создано',
    'Обновлено',
    'Дедлайн',
    'ID',
  ];

  const rows = posts.map(post => [
    post.title?.trim() || 'Без названия',
    post.urgent ? 'Да' : 'Нет',
    post.isPrivate ? 'Да' : 'Нет',
    formatExportDateTime(post.createdAt),
    formatExportDateTime(post.updatedAt),
    formatExportDate(post.deadline),
    post.id,
  ]);

  downloadCsv(buildExportFilename(), headers, rows);
};
