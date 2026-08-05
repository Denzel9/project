import { format, isValid } from 'date-fns';

import { TASK_STATUS_LABELS, type Task } from '@/entities';
import { downloadCsv } from '@/shared/lib/export';

import { getTaskCustomerName, getTaskTitle } from '../utils/utils';

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

  return `zadachi_${date}.csv`;
};

export const exportTasksReport = (tasks: Task[]) => {
  const headers = [
    'Название',
    'Статус',
    'Заказчик',
    'Обновлено',
    'Дедлайн',
    'Срочная',
    'ID',
  ];

  const rows = tasks.map(task => [
    getTaskTitle(task),
    TASK_STATUS_LABELS[task.status],
    getTaskCustomerName(task) || '—',
    formatExportDateTime(task.updatedAt),
    formatExportDate(task.finalDate),
    task.urgent ? 'Да' : 'Нет',
    task.id,
  ]);

  downloadCsv(buildExportFilename(), headers, rows);
};
