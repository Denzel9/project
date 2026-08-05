import { format } from 'date-fns';

import {
  fetchPartnerApplicants,
  fetchPartnerApplicationCompanies,
  fetchPartnerCustomers,
  fetchPartnerExecutors,
  mapApplicationCompanyToRow,
  mapPartnerUserToRow,
  normalizePartnerApplicationCompany,
  normalizePartnerUser,
} from '@/entities';
import { downloadCsv } from '@/shared/lib/export';
import { fetchAllPages } from '@/shared/lib/pagination/fetchAllPages';

import { DEFAULT_APPLICANT_STATUSES, formatDateTime } from './utils';

import type { ApplicationCompanyRow, PartnersTabId, TaskContactRow } from './types';

const EXPORT_FILENAME_PREFIX: Record<PartnersTabId, string> = {
  executors: 'ispolniteli',
  applicants: 'kandidaty',
  customers: 'zakazchiki',
  companies: 'kompanii',
};

const CONTACT_COLUMN_LABEL: Record<
  Exclude<PartnersTabId, 'companies'>,
  string
> = {
  executors: 'Исполнитель',
  applicants: 'Кандидат',
  customers: 'Заказчик',
};

const buildExportFilename = (tabId: PartnersTabId) => {
  const date = format(new Date(), 'yyyy-MM-dd');

  return `${EXPORT_FILENAME_PREFIX[tabId]}_${date}.csv`;
};

const buildTaskContactsCsv = (
  rows: TaskContactRow[],
  contactColumnLabel: string,
  interactionsColumnLabel = 'Взаимодействий',
) => {
  const headers = [
    contactColumnLabel,
    interactionsColumnLabel,
    'Публикации',
    'Последнее взаимодействие',
    'ID',
  ];
  const data = rows.map(row => [
    row.name,
    String(row.interactionsCount),
    String(row.publicationsCount),
    formatDateTime(row.lastInteractionAt, 'dd.MM.yyyy HH:mm'),
    row.id,
  ]);

  return { headers, data };
};

const buildCompaniesCsv = (rows: ApplicationCompanyRow[]) => {
  const headers = ['Компания', 'Откликов', 'Объявлений', 'Последний отклик', 'ID'];
  const data = rows.map(row => [
    row.name,
    String(row.applicationsCount),
    String(row.postsCount),
    formatDateTime(row.lastActivityAt, 'dd.MM.yyyy HH:mm'),
    row.id,
  ]);

  return { headers, data };
};

export const fetchPartnersExportRows = async (
  tabId: PartnersTabId,
): Promise<TaskContactRow[] | ApplicationCompanyRow[]> => {
  switch (tabId) {
    case 'executors': {
      const items = await fetchAllPages((page, limit) =>
        fetchPartnerExecutors({ sort: 'name' }, page, limit),
      );

      return items.map(normalizePartnerUser).map(mapPartnerUserToRow);
    }

    case 'applicants': {
      const items = await fetchAllPages((page, limit) =>
        fetchPartnerApplicants(
          { statuses: [...DEFAULT_APPLICANT_STATUSES] },
          page,
          limit,
        ),
      );

      return items.map(normalizePartnerUser).map(mapPartnerUserToRow);
    }

    case 'customers': {
      const items = await fetchAllPages((page, limit) =>
        fetchPartnerCustomers({ sort: 'name' }, page, limit),
      );

      return items.map(normalizePartnerUser).map(mapPartnerUserToRow);
    }

    case 'companies': {
      const items = await fetchAllPages((page, limit) =>
        fetchPartnerApplicationCompanies({ sort: 'recent' }, page, limit),
      );

      return items
        .map(normalizePartnerApplicationCompany)
        .map(mapApplicationCompanyToRow);
    }

    default:
      return [];
  }
};

export const exportPartnersReport = async (tabId: PartnersTabId) => {
  const rows = await fetchPartnersExportRows(tabId);
  const filename = buildExportFilename(tabId);

  if (tabId === 'companies') {
    const { headers, data } = buildCompaniesCsv(rows as ApplicationCompanyRow[]);

    downloadCsv(filename, headers, data);
    return;
  }

  const contactColumnLabel = CONTACT_COLUMN_LABEL[tabId];
  const interactionsColumnLabel =
    tabId === 'applicants' ? 'Отклики' : 'Взаимодействий';
  const { headers, data } = buildTaskContactsCsv(
    rows as TaskContactRow[],
    contactColumnLabel,
    interactionsColumnLabel,
  );

  downloadCsv(filename, headers, data);
};
