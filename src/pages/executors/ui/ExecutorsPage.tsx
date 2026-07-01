import { Alert, Box } from '@mui/material';
import { useMemo, useState } from 'react';

import {
  USER_ROLE,
  mapApplicationCompanyToRow,
  mapTaskContactToRow,
  normalizePartnerApplicationCompany,
  normalizePartnerTaskContact,
  usePartnerApplicantsQuery,
  usePartnerApplicationCompaniesQuery,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities';
import { useAuthStore } from '@/features';
import { PageLayout } from '@/widgets';

import {
  DEFAULT_APPLICANT_STATUSES,
  getPartnersPageConfig,
} from '../model/utils';
import type { PartnersTabId } from '../model/types';

import { ApplicantsTable } from './ApplicantsTable';
import { ApplicationCompaniesTable } from './ApplicationCompaniesTable';
import { PartnersTableSkeleton } from './PartnersTableSkeleton';
import { PartnersTabs } from './PartnersTabs';
import { TaskContactsTable } from './TaskContactsTable';

const EMPTY_MESSAGES: Record<PartnersTabId, string> = {
  executors: 'Пока нет исполнителей',
  applicants: 'Пока нет кандидатов',
  customers: 'Пока нет заказчиков',
  companies: 'Пока нет компаний по вашим откликам',
};

const CONTACT_LABELS: Partial<Record<PartnersTabId, string>> = {
  executors: 'Исполнитель',
  customers: 'Заказчик',
};

export const ExecutorsPage = () => {
  const { role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;

  const pageConfig = useMemo(() => getPartnersPageConfig(role), [role]);
  const [activeTab, setActiveTab] = useState<PartnersTabId>(pageConfig.defaultTab);

  const executorsQuery = usePartnerExecutorsQuery(
    { sort: 'name' },
    { enabled: isCompany && activeTab === 'executors' },
  );

  const applicantsQuery = usePartnerApplicantsQuery(
    { statuses: [...DEFAULT_APPLICANT_STATUSES] },
    { enabled: isCompany && activeTab === 'applicants' },
  );

  const customersQuery = usePartnerCustomersQuery(
    { sort: 'name' },
    { enabled: !isCompany && activeTab === 'customers' },
  );

  const companiesQuery = usePartnerApplicationCompaniesQuery(
    { sort: 'recent', limit: 20 },
    { enabled: !isCompany && activeTab === 'companies' },
  );

  const activeQuery = useMemo(() => {
    switch (activeTab) {
      case 'executors':
        return executorsQuery;
      case 'applicants':
        return applicantsQuery;
      case 'customers':
        return customersQuery;
      case 'companies':
        return companiesQuery;
      default:
        return executorsQuery;
    }
  }, [
    activeTab,
    applicantsQuery,
    companiesQuery,
    customersQuery,
    executorsQuery,
  ]);

  const executorRows = useMemo(
    () =>
      (executorsQuery.data?.items ?? [])
        .map(normalizePartnerTaskContact)
        .map(mapTaskContactToRow),
    [executorsQuery.data?.items],
  );

  const customerRows = useMemo(
    () =>
      (customersQuery.data?.items ?? [])
        .map(normalizePartnerTaskContact)
        .map(mapTaskContactToRow),
    [customersQuery.data?.items],
  );

  const companyRows = useMemo(
    () =>
      (companiesQuery.data?.items ?? [])
        .map(normalizePartnerApplicationCompany)
        .map(mapApplicationCompanyToRow),
    [companiesQuery.data?.items],
  );

  const renderContent = () => {
    if (activeQuery.isLoading) {
      return <PartnersTableSkeleton />;
    }

    if (activeQuery.isError) {
      return (
        <Alert severity="error">
          Не удалось загрузить данные. Попробуйте обновить страницу.
        </Alert>
      );
    }

    switch (activeTab) {
      case 'executors':
        return (
          <TaskContactsTable
            items={executorRows}
            contactColumnLabel={CONTACT_LABELS.executors ?? 'Контакт'}
            emptyMessage={EMPTY_MESSAGES.executors}
          />
        );

      case 'applicants':
        return (
          <ApplicantsTable
            items={applicantsQuery.data?.items ?? []}
            emptyMessage={EMPTY_MESSAGES.applicants}
          />
        );

      case 'customers':
        return (
          <TaskContactsTable
            items={customerRows}
            contactColumnLabel={CONTACT_LABELS.customers ?? 'Контакт'}
            emptyMessage={EMPTY_MESSAGES.customers}
          />
        );

      case 'companies':
        return (
          <ApplicationCompaniesTable
            items={companyRows}
            emptyMessage={EMPTY_MESSAGES.companies}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout
      title={pageConfig.title}
      withFooter={false}
    >
      <PartnersTabs
        tabs={pageConfig.tabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      <Box>{renderContent()}</Box>
    </PageLayout>
  );
};

export default ExecutorsPage;
