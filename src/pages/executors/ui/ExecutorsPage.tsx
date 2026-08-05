import { Alert, Box, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import {
  USER_ROLE,
  getPartnerName,
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
import {
  FilterAutocomplete,
  ROUTES,
  type FilterAutocompleteOption,
} from '@/shared';
import { PageLayout } from '@/widgets';

import { CONTACT_LABELS, EMPTY_MESSAGES, PARTNERS_TABLE_PAGE_SIZE, USER_SEARCH_LIMIT, USER_SEARCH_MIN } from '../model/constants';
import { exportPartnersReport } from '../model/exportPartnersReport';
import {
  DEFAULT_APPLICANT_STATUSES,
  getPartnersPageConfig,
  openInNewTab,
} from '../model/utils';

import { ApplicationCompaniesTable } from './ApplicationCompaniesTable';
import { PartnersPrintHeader } from './PartnersPrintHeader';
import { PartnersReportToolbar } from './PartnersReportToolbar';
import { PartnersTableSkeleton } from './PartnersTableSkeleton';
import { PartnersTabs } from './PartnersTabs';
import { TaskContactsTable } from './TaskContactsTable';

import type { PartnersTabId, TaskContactRow } from '../model/types';

export const ExecutorsPage = () => {
  const { role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;
  const [isExporting, setIsExporting] = useState(false);

  const pageConfig = useMemo(() => getPartnersPageConfig(role), [role]);
  const [activeTab, setActiveTab] = useState<PartnersTabId>(
    pageConfig.defaultTab,
  );
  const [userFilterId, setUserFilterId] = useState('all');
  const [selectedUserOption, setSelectedUserOption] =
    useState<FilterAutocompleteOption | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const userIdParam = userFilterId === 'all' ? undefined : userFilterId;
  const canSearchUsers = userSearchQuery.trim().length >= USER_SEARCH_MIN;

  const userSearchParams = {
    q: userSearchQuery.trim(),
    sort: 'name' as const,
    page: 1,
    limit: USER_SEARCH_LIMIT,
  };

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
    { enabled: isCompany && activeTab === 'executors' },
  );

  const applicantsQuery = usePartnerApplicantsQuery(
    {
      statuses: [...DEFAULT_APPLICANT_STATUSES],
      ...paginationParams,
    },
    { enabled: isCompany && activeTab === 'applicants' },
  );

  const customersQuery = usePartnerCustomersQuery(
    {
      sort: 'name',
      ...paginationParams,
    },
    { enabled: !isCompany && activeTab === 'customers' },
  );

  const companiesQuery = usePartnerApplicationCompaniesQuery(
    {
      sort: 'recent',
      ...paginationParams,
    },
    { enabled: !isCompany && activeTab === 'companies' },
  );

  const searchExecutorsQuery = usePartnerExecutorsQuery(userSearchParams, {
    enabled: isCompany && activeTab === 'executors' && canSearchUsers,
  });

  const searchApplicantsQuery = usePartnerApplicantsQuery(
    {
      ...userSearchParams,
      statuses: [...DEFAULT_APPLICANT_STATUSES],
    },
    { enabled: isCompany && activeTab === 'applicants' && canSearchUsers },
  );

  const searchCustomersQuery = usePartnerCustomersQuery(userSearchParams, {
    enabled: !isCompany && activeTab === 'customers' && canSearchUsers,
  });

  const searchCompaniesQuery = usePartnerApplicationCompaniesQuery(
    userSearchParams,
    { enabled: !isCompany && activeTab === 'companies' && canSearchUsers },
  );

  const userSearchOptions = useMemo(() => {
    if (!canSearchUsers) return [];

    if (activeTab === 'companies') {
      return (searchCompaniesQuery.data?.items ?? [])
        .map(normalizePartnerApplicationCompany)
        .map(item => ({
          id: item.id,
          label: getPartnerName(item),
        }));
    }

    const items =
      activeTab === 'executors'
        ? (searchExecutorsQuery.data?.items ?? [])
        : activeTab === 'applicants'
          ? (searchApplicantsQuery.data?.items ?? [])
          : (searchCustomersQuery.data?.items ?? []);

    return items.map(normalizePartnerUser).map(item => ({
      id: item.id,
      label: getPartnerName(item),
    }));
  }, [
    activeTab,
    canSearchUsers,
    searchApplicantsQuery.data?.items,
    searchCompaniesQuery.data?.items,
    searchCustomersQuery.data?.items,
    searchExecutorsQuery.data?.items,
  ]);

  const handleTabChange = (tab: PartnersTabId) => {
    setActiveTab(tab);
    setUserFilterId('all');
    setSelectedUserOption(null);
    setUserSearchQuery('');
    setPage(0);
  };

  const handleUserFilterChange = (nextId: string) => {
    setUserFilterId(nextId);
    setPage(0);

    if (nextId === 'all') {
      setSelectedUserOption(null);
      return;
    }

    const fromSearch = userSearchOptions.find(option => option.id === nextId);
    setSelectedUserOption(current =>
      fromSearch ?? (current?.id === nextId ? current : null),
    );
  };

  const handlePageChange = useCallback((_event: unknown, nextPage: number) => {
    setPage(nextPage);
  }, []);

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

  const activeSearchQuery = useMemo(() => {
    switch (activeTab) {
      case 'executors':
        return searchExecutorsQuery;
      case 'applicants':
        return searchApplicantsQuery;
      case 'customers':
        return searchCustomersQuery;
      case 'companies':
        return searchCompaniesQuery;
      default:
        return searchExecutorsQuery;
    }
  }, [
    activeTab,
    searchApplicantsQuery,
    searchCompaniesQuery,
    searchCustomersQuery,
    searchExecutorsQuery,
  ]);

  const activeTabLabel = useMemo(
    () => pageConfig.tabs.find(tab => tab.id === activeTab)?.label ?? activeTab,
    [activeTab, pageConfig.tabs],
  );

  const activeTotal = activeQuery.data?.total ?? 0;
  const reportDisabled =
    activeQuery.isLoading || activeQuery.isError || activeTotal === 0;

  const executorRows = useMemo(
    () =>
      (executorsQuery.data?.items ?? [])
        .map(normalizePartnerUser)
        .map(mapPartnerUserToRow),
    [executorsQuery.data?.items],
  );

  const applicantRows = useMemo(
    () =>
      (applicantsQuery.data?.items ?? [])
        .map(normalizePartnerUser)
        .map(mapPartnerUserToRow),
    [applicantsQuery.data?.items],
  );

  const customerRows = useMemo(
    () =>
      (customersQuery.data?.items ?? [])
        .map(normalizePartnerUser)
        .map(mapPartnerUserToRow),
    [customersQuery.data?.items],
  );

  const companyRows = useMemo(
    () =>
      (companiesQuery.data?.items ?? [])
        .map(normalizePartnerApplicationCompany)
        .map(mapApplicationCompanyToRow),
    [companiesQuery.data?.items],
  );

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
      `${ROUTES.MY_TASKS}?executorId=${encodeURIComponent(item.id)}`,
    );
  }, []);

  const handleApplicantInteractionsClick = useCallback(
    (item: TaskContactRow) => {
      openInNewTab(
        `${ROUTES.MANAGE_POSTS}?userId=${encodeURIComponent(item.id)}`,
      );
    },
    [],
  );

  const handlePublicationsClick = useCallback((item: TaskContactRow) => {
    openInNewTab(
      `${ROUTES.PUBLICATIONS}?executorId=${encodeURIComponent(item.id)}`,
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
              value={userFilterId}
              options={userSearchOptions}
              selectedOption={selectedUserOption}
              label={userFilterLabel}
              loading={canSearchUsers && activeSearchQuery.isFetching}
              minInputLength={USER_SEARCH_MIN}
              onSearch={setUserSearchQuery}
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
