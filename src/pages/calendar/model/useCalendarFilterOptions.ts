import { useMemo } from 'react';

import {
  USER_ROLE,
  getPartnerName,
  mapPartnerUserToRow,
  usePartnerCustomersQuery,
  usePartnerExecutorsQuery,
} from '@/entities';
import { useAuthStore } from '@/features';

import type { CalendarFilterOption } from './types';

export const useCalendarFilterOptions = () => {
  const role = useAuthStore(state => state.role);
  const isCompany = role === USER_ROLE.COMPANY;

  const executorsQuery = usePartnerExecutorsQuery(
    { sort: 'name' },
    { enabled: isCompany },
  );

  const customersQuery = usePartnerCustomersQuery(
    { sort: 'name' },
    { enabled: !isCompany },
  );

  const companyOptions = useMemo<CalendarFilterOption[]>(() => {
    const items = isCompany
      ? (executorsQuery.data?.items ?? [])
      : (customersQuery.data?.items ?? []);

    return items
      .map(item => ({
        id: item.id,
        label: isCompany ? mapPartnerUserToRow(item).name : getPartnerName(item),
      }))
      .sort((left, right) => left.label.localeCompare(right.label, 'ru'));
  }, [customersQuery.data?.items, executorsQuery.data?.items, isCompany]);

  return {
    isCompany,
    companyOptions,
    isLoadingCompanies: isCompany
      ? executorsQuery.isLoading
      : customersQuery.isLoading,
  };
};
