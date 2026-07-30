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
import { FilterAutocomplete, useAuthStore } from '@/features';
import { ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import { PARTNERS_TABLE_PAGE_SIZE } from '../model/constants';
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

import type { PartnersTabId, TaskContactRow } from '../model/types';

const openInNewTab = (path: string) => {
  window.open(path, '_blank', 'noopener,noreferrer');
};

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
  const [userFilterId, setUserFilterId] = useState('all');
  const [page, setPage] = useState(0);

  const userIdParam = userFilterId === 'all' ? undefined : userFilterId;

  const handleTabChange = (tab: PartnersTabId) => {
    setActiveTab(tab);
    setUserFilterId('all');
    setPage(0);
  };

  const handleUserFilterChange = (value: string) => {
    setUserFilterId(value);
    setPage(0);
  };

  const handlePageChange = useCallback((_event: unknown, nextPage: number) => {
    setPage(nextPage);
  }, []);

  const paginationParams = {
    page: page + 1,
    limit: PARTNERS_TABLE_PAGE_SIZE,
    ...(userIdParam && { userId: userIdParam }),
  };

  const executorsQuery = usePartnerExecutorsQuery(
    {
      sort: 'name',
      ...paginationParams,
    },
    { enabled: isCompany && activeTab === 'executors' }
  );

  const applicantsQuery = usePartnerApplicantsQuery(
    {
      statuses: [...DEFAULT_APPLICANT_STATUSES],
      ...paginationParams,
    },
    { enabled: isCompany && activeTab === 'applicants' }
  );

  const customersQuery = usePartnerCustomersQuery(
    {
      sort: 'name',
      ...paginationParams,
    },
    { enabled: !isCompany && activeTab === 'customers' }
  );

  const companiesQuery = usePartnerApplicationCompaniesQuery(
    {
      sort: 'recent',
      ...paginationParams,
    },
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

  const userOptions = useMemo(() => {
    const rows =
      activeTab === 'executors'
        ? executorRows
        : activeTab === 'applicants'
          ? applicantRows
          : activeTab === 'customers'
            ? customerRows
            : companyRows;

    const options = rows.map(row => ({
      id: row.id,
      label: row.name,
    }));

    if (
      userFilterId !== 'all' &&
      !options.some(option => option.id === userFilterId)
    ) {
      options.unshift({ id: userFilterId, label: 'Выбранный пользователь' });
    }

    return options;
  }, [
    activeTab,
    applicantRows,
    companyRows,
    customerRows,
    executorRows,
    userFilterId,
  ]);

  const userFilterLabel = useMemo(() => {
    switch (activeTab) {
      case 'executors':
        return 'Исполнитель';
      case 'applicants':
        return 'Кандидат';
      case 'customers':
        return 'Заказчик';
      case 'companies':
        return 'Компания';
      default:
        return 'Пользователь';
    }
  }, [activeTab]);

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

  const handleInteractionsClick = useCallback((item: TaskContactRow) => {
    openInNewTab(
      `${ROUTES.MY_TASKS}?executorId=${encodeURIComponent(item.id)}`
    );
  }, []);

  const handleApplicantInteractionsClick = useCallback(
    (item: TaskContactRow) => {
      openInNewTab(
        `${ROUTES.MANAGE_POSTS}?userId=${encodeURIComponent(item.id)}`
      );
    },
    []
  );

  const handlePublicationsClick = useCallback((item: TaskContactRow) => {
    openInNewTab(
      `${ROUTES.PUBLICATIONS}?executorId=${encodeURIComponent(item.id)}`
    );
  }, []);

  const paginationProps = {
    page,
    total: activeTotal,
    rowsPerPage: PARTNERS_TABLE_PAGE_SIZE,
    onPageChange: handlePageChange,
  };

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
            onInteractionsClick={handleInteractionsClick}
            onPublicationsClick={handlePublicationsClick}
            {...paginationProps}
          />
        );

      case 'applicants':
        return (
          <TaskContactsTable
            items={applicantRows}
            contactColumnLabel={CONTACT_LABELS.applicants ?? 'Кандидат'}
            interactionsColumnLabel="Отклики"
            emptyMessage={EMPTY_MESSAGES.applicants}
            onInteractionsClick={handleApplicantInteractionsClick}
            onPublicationsClick={handlePublicationsClick}
            {...paginationProps}
          />
        );

      case 'customers':
        return (
          <TaskContactsTable
            items={customerRows}
            contactColumnLabel={CONTACT_LABELS.customers ?? 'Контакт'}
            emptyMessage={EMPTY_MESSAGES.customers}
            onInteractionsClick={handleInteractionsClick}
            onPublicationsClick={handlePublicationsClick}
            {...paginationProps}
          />
        );

      case 'companies':
        return (
          <ApplicationCompaniesTable
            items={companyRows}
            emptyMessage={EMPTY_MESSAGES.companies}
            {...paginationProps}
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
      isScreenHeight
    >
      <Box
        className="partners-print-root"
        sx={{
          flex: 1,
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mb: 2,
            px: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            flexShrink: 0,
          }}
        >
          <PartnersTabs
            value={activeTab}
            tabs={pageConfig.tabs}
            onChange={handleTabChange}
          />

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              flexShrink: 0,
              ml: 'auto',
            }}
          >
            <PartnersReportToolbar
              onPrint={handlePrint}
              onExport={handleExport}
              disabled={reportDisabled}
              isExporting={isExporting}
            />

            <FilterAutocomplete
              label={userFilterLabel}
              value={userFilterId}
              options={userOptions}
              onChange={handleUserFilterChange}
              sx={{ width: 280, flex: '0 0 280px' }}
            />
          </Stack>
        </Stack>

        <PartnersPrintHeader
          pageTitle={pageConfig.title}
          tabLabel={activeTabLabel}
          total={activeTotal}
        />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </PageLayout>
  );
};

export default ExecutorsPage;
