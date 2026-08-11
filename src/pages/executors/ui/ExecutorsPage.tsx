import { Alert, Box, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import {
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
import { type FilterAutocompleteOption, ROUTES, stickyFilterSx } from '@/shared';
import { PageLayout } from '@/widgets';

import {
  CONTACT_LABELS,
  EMPTY_MESSAGES,
  PARTNERS_TABLE_PAGE_SIZE,
  USER_SEARCH_LIMIT,
  USER_SEARCH_MIN,
} from '../model/constants';
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

import type {
  PartnersTabId,
  PartnersUserColumnFilter,
  TaskContactRow,
} from '../model/types';

export const ExecutorsPage = () => {
  const { role } = useAuthStore();
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
  const searchQuery = userSearchQuery.trim();
  const listPage = page + 1;
  const listLimit = PARTNERS_TABLE_PAGE_SIZE;

  const listFilterParams = useMemo(
    () => ({
      ...(userIdParam && { userId: userIdParam }),
    }),
    [userIdParam],
  );

  const executorsQuery = usePartnerExecutorsQuery(
    {
      ...listFilterParams,
      sort: 'name',
      page: listPage,
      limit: listLimit,
    },
    { enabled: activeTab === 'executors' },
  );
  const applicantsQuery = usePartnerApplicantsQuery(
    {
      ...listFilterParams,
      statuses: [...DEFAULT_APPLICANT_STATUSES],
      page: listPage,
      limit: listLimit,
    },
    { enabled: activeTab === 'applicants' },
  );
  const customersQuery = usePartnerCustomersQuery(
    {
      ...listFilterParams,
      sort: 'name',
      page: listPage,
      limit: listLimit,
    },
    { enabled: activeTab === 'customers' },
  );
  const companiesQuery = usePartnerApplicationCompaniesQuery(
    {
      ...listFilterParams,
      sort: 'recent',
      page: listPage,
      limit: listLimit,
    },
    { enabled: activeTab === 'companies' },
  );

  const executorsSearch = usePartnerExecutorsQuery(
    { q: searchQuery, sort: 'name', page: 1, limit: USER_SEARCH_LIMIT },
    { enabled: activeTab === 'executors' && canSearchUsers },
  );
  const applicantsSearch = usePartnerApplicantsQuery(
    {
      q: searchQuery,
      statuses: [...DEFAULT_APPLICANT_STATUSES],
      page: 1,
      limit: USER_SEARCH_LIMIT,
    },
    { enabled: activeTab === 'applicants' && canSearchUsers },
  );
  const customersSearch = usePartnerCustomersQuery(
    { q: searchQuery, sort: 'name', page: 1, limit: USER_SEARCH_LIMIT },
    { enabled: activeTab === 'customers' && canSearchUsers },
  );
  const companiesSearch = usePartnerApplicationCompaniesQuery(
    { q: searchQuery, sort: 'name', page: 1, limit: USER_SEARCH_LIMIT },
    { enabled: activeTab === 'companies' && canSearchUsers },
  );

  const listQuery =
    activeTab === 'executors'
      ? executorsQuery
      : activeTab === 'applicants'
        ? applicantsQuery
        : activeTab === 'customers'
          ? customersQuery
          : companiesQuery;

  const searchQueryResult =
    activeTab === 'executors'
      ? executorsSearch
      : activeTab === 'applicants'
        ? applicantsSearch
        : activeTab === 'customers'
          ? customersSearch
          : companiesSearch;

  const userSearchOptions = useMemo(() => {
    if (!canSearchUsers) return [];

    if (activeTab === 'companies') {
      return (companiesSearch.data?.items ?? [])
        .map(normalizePartnerApplicationCompany)
        .map(item => ({
          id: item.id,
          label: getPartnerName(item),
        }));
    }

    const items =
      activeTab === 'executors'
        ? (executorsSearch.data?.items ?? [])
        : activeTab === 'applicants'
          ? (applicantsSearch.data?.items ?? [])
          : (customersSearch.data?.items ?? []);

    return items.map(normalizePartnerUser).map(item => ({
      id: item.id,
      label: getPartnerName(item),
    }));
  }, [
    activeTab,
    applicantsSearch.data?.items,
    canSearchUsers,
    companiesSearch.data?.items,
    customersSearch.data?.items,
    executorsSearch.data?.items,
  ]);

  const handleTabChange = (tab: PartnersTabId) => {
    setActiveTab(tab);
    setUserFilterId('all');
    setSelectedUserOption(null);
    setUserSearchQuery('');
    setPage(0);
  };

  const handleUserFilterChange = useCallback(
    (nextId: string) => {
      setUserFilterId(nextId);
      setPage(0);

      if (nextId === 'all') {
        setSelectedUserOption(null);
        return;
      }

      setSelectedUserOption(current => {
        const fromSearch = userSearchOptions.find(option => option.id === nextId);

        return fromSearch ?? (current?.id === nextId ? current : null);
      });
    },
    [userSearchOptions],
  );

  const handlePageChange = useCallback((_event: unknown, nextPage: number) => {
    setPage(nextPage);
  }, []);

  const activeTabLabel = useMemo(
    () => pageConfig.tabs.find(tab => tab.id === activeTab)?.label ?? activeTab,
    [activeTab, pageConfig.tabs],
  );

  const activeTotal = listQuery.data?.total ?? 0;
  const reportDisabled =
    listQuery.isLoading || listQuery.isError || activeTotal === 0;

  const contactRows = useMemo(() => {
    if (activeTab === 'companies') return [];

    const items =
      activeTab === 'executors'
        ? (executorsQuery.data?.items ?? [])
        : activeTab === 'applicants'
          ? (applicantsQuery.data?.items ?? [])
          : (customersQuery.data?.items ?? []);

    return items.map(normalizePartnerUser).map(mapPartnerUserToRow);
  }, [
    activeTab,
    applicantsQuery.data?.items,
    customersQuery.data?.items,
    executorsQuery.data?.items,
  ]);

  const companyRows = useMemo(() => {
    if (activeTab !== 'companies') return [];

    return (companiesQuery.data?.items ?? [])
      .map(normalizePartnerApplicationCompany)
      .map(mapApplicationCompanyToRow);
  }, [activeTab, companiesQuery.data?.items]);

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
        `${ROUTES.POSTS_RESPONSES}?userId=${encodeURIComponent(item.id)}`,
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

  const userColumnFilter = useMemo<PartnersUserColumnFilter>(
    () => ({
      value: userFilterId,
      options: userSearchOptions,
      selectedOption: selectedUserOption,
      label: userFilterLabel,
      loading: canSearchUsers && searchQueryResult.isFetching,
      minInputLength: USER_SEARCH_MIN,
      onSearch: setUserSearchQuery,
      onChange: handleUserFilterChange,
    }),
    [
      canSearchUsers,
      handleUserFilterChange,
      searchQueryResult.isFetching,
      selectedUserOption,
      userFilterId,
      userFilterLabel,
      userSearchOptions,
    ],
  );

  const renderContent = () => {
    if (listQuery.isLoading) {
      return <PartnersTableSkeleton />;
    }

    if (listQuery.isError) {
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
            items={contactRows}
            contactColumnLabel={CONTACT_LABELS.executors ?? 'Контакт'}
            emptyMessage={EMPTY_MESSAGES.executors}
            userFilter={userColumnFilter}
            onInteractionsClick={handleInteractionsClick}
            onPublicationsClick={handlePublicationsClick}
            {...paginationProps}
          />
        );

      case 'applicants':
        return (
          <TaskContactsTable
            items={contactRows}
            contactColumnLabel={CONTACT_LABELS.applicants ?? 'Кандидат'}
            interactionsColumnLabel="Отклики"
            emptyMessage={EMPTY_MESSAGES.applicants}
            userFilter={userColumnFilter}
            onInteractionsClick={handleApplicantInteractionsClick}
            onPublicationsClick={handlePublicationsClick}
            {...paginationProps}
          />
        );

      case 'customers':
        return (
          <TaskContactsTable
            items={contactRows}
            contactColumnLabel={CONTACT_LABELS.customers ?? 'Контакт'}
            emptyMessage={EMPTY_MESSAGES.customers}
            userFilter={userColumnFilter}
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
            userFilter={userColumnFilter}
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
          overflow: 'hidden',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            ...stickyFilterSx,
            p: 2,
            mb: 1,
            bgcolor: 'white',
            border: '1px solid',
            borderRadius: '24px',
            alignItems: 'center',
            borderColor: 'divider',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <PartnersTabs
            value={activeTab}
            tabs={pageConfig.tabs}
            onChange={handleTabChange}
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
