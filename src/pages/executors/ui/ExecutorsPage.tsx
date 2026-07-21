import { Alert, Box, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import {
  USER_ROLE,
  mapApplicationCompanyToRow,
  mapPartnerUserToRow,
  normalizePartnerApplicationCompany,
  normalizePartnerUser,
  usePartnerApplicantsQuery,
  usePartnerApplicationCompaniesQuery,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities';
import { useAuthStore } from '@/features';
import { PageLayout } from '@/widgets';

import { exportPartnersReport } from '../model/exportPartnersReport';
import {
  DEFAULT_APPLICANT_STATUSES,
  getPartnersPageConfig,
} from '../model/utils';

import { ApplicationCompaniesTable } from './ApplicationCompaniesTable';
import { PartnersPrintHeader } from './PartnersPrintHeader';
import { PartnersReportToolbar } from './PartnersReportToolbar';
import { PartnersTableSkeleton } from './PartnersTableSkeleton';
import { PartnersTabs } from './PartnersTabs';
import { TaskContactsTable } from './TaskContactsTable';

import type { PartnersTabId } from '../model/types';

const EMPTY_MESSAGES: Record<PartnersTabId, string> = {
  executors: 'Пока нет исполнителей',
  applicants: 'Пока нет кандидатов',
  customers: 'Пока нет заказчиков',
  companies: 'Пока нет компаний по вашим откликам',
};

const CONTACT_LABELS: Partial<Record<PartnersTabId, string>> = {
  executors: 'Исполнитель',
  applicants: 'Кандидат',
  customers: 'Заказчик',
};

export const ExecutorsPage = () => {
  const { role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;
  const [isExporting, setIsExporting] = useState(false);

  const pageConfig = useMemo(() => getPartnersPageConfig(role), [role]);
  const [activeTab, setActiveTab] = useState<PartnersTabId>(
    pageConfig.defaultTab
  );

  const executorsQuery = usePartnerExecutorsQuery(
    { sort: 'name' },
    { enabled: isCompany && activeTab === 'executors' }
  );

  const applicantsQuery = usePartnerApplicantsQuery(
    { statuses: [...DEFAULT_APPLICANT_STATUSES] },
    { enabled: isCompany && activeTab === 'applicants' }
  );

  const customersQuery = usePartnerCustomersQuery(
    { sort: 'name' },
    { enabled: !isCompany && activeTab === 'customers' }
  );

  const companiesQuery = usePartnerApplicationCompaniesQuery(
    { sort: 'recent', limit: 20 },
    { enabled: !isCompany && activeTab === 'companies' }
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

  const activeTabLabel = useMemo(
    () => pageConfig.tabs.find(tab => tab.id === activeTab)?.label ?? activeTab,
    [activeTab, pageConfig.tabs]
  );

  const activeTotal = activeQuery.data?.total ?? 0;
  const reportDisabled =
    activeQuery.isLoading || activeQuery.isError || activeTotal === 0;

  const executorRows = useMemo(
    () =>
      (executorsQuery.data?.items ?? [])
        .map(normalizePartnerUser)
        .map(mapPartnerUserToRow),
    [executorsQuery.data?.items]
  );

  const applicantRows = useMemo(
    () =>
      (applicantsQuery.data?.items ?? [])
        .map(normalizePartnerUser)
        .map(mapPartnerUserToRow),
    [applicantsQuery.data?.items]
  );

  const customerRows = useMemo(
    () =>
      (customersQuery.data?.items ?? [])
        .map(normalizePartnerUser)
        .map(mapPartnerUserToRow),
    [customersQuery.data?.items]
  );

  const companyRows = useMemo(
    () =>
      (companiesQuery.data?.items ?? [])
        .map(normalizePartnerApplicationCompany)
        .map(mapApplicationCompanyToRow),
    [companiesQuery.data?.items]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      await exportPartnersReport(activeTab);
    } catch (error) {
      console.error('Failed to export partners report', error);
    } finally {
      setIsExporting(false);
    }
  }, [activeTab]);

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
          <TaskContactsTable
            items={applicantRows}
            contactColumnLabel={CONTACT_LABELS.applicants ?? 'Кандидат'}
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
      withFooter={false}
      printHide
    >
      <Box
        className="partners-print-root"
        sx={{ pb: 2 }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mb: 2,
            px: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <PartnersTabs
            value={activeTab}
            tabs={pageConfig.tabs}
            onChange={setActiveTab}
          />

          <PartnersReportToolbar
            onPrint={handlePrint}
            onExport={handleExport}
            disabled={reportDisabled}
            isExporting={isExporting}
          />
        </Stack>

        <PartnersPrintHeader
          pageTitle={pageConfig.title}
          tabLabel={activeTabLabel}
          total={activeTotal}
        />

        {/* TODO добавить сортировку */}
        <Box>{renderContent()}</Box>
      </Box>
    </PageLayout>
  );
};

export default ExecutorsPage;
