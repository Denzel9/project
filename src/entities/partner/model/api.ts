import { useQuery } from '@tanstack/react-query';

import { mainAxios } from '@/shared/api';

import type {
  PartnerApplicantList,
  PartnerApplicantsParams,
  PartnerApplicationCompaniesParams,
  PartnerApplicationCompanyList,
  PartnerTaskContactList,
  PartnerTaskContactsParams,
} from './types';

export const partnerKeys = {
  all: ['partners'] as const,
  executors: (params?: PartnerTaskContactsParams) =>
    [...partnerKeys.all, 'executors', params ?? {}] as const,
  customers: (params?: PartnerTaskContactsParams) =>
    [...partnerKeys.all, 'customers', params ?? {}] as const,
  applicants: (params?: PartnerApplicantsParams) =>
    [...partnerKeys.all, 'applicants', params ?? {}] as const,
  applicationCompanies: (params?: PartnerApplicationCompaniesParams) =>
    [...partnerKeys.all, 'applicationCompanies', params ?? {}] as const,
};

const serializeApplicantsParams = (params?: PartnerApplicantsParams) => {
  if (!params) return undefined;

  const { statuses, ...rest } = params;

  return {
    ...rest,
    ...(statuses?.length ? { statuses: statuses.join(',') } : {}),
  };
};

export const usePartnerExecutorsQuery = (
  params?: PartnerTaskContactsParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: partnerKeys.executors(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<PartnerTaskContactList>(
        '/partners/tasks/executors',
        { params },
      );

      return data;
    },
    enabled: options?.enabled ?? true,
  });

export const usePartnerCustomersQuery = (
  params?: PartnerTaskContactsParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: partnerKeys.customers(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<PartnerTaskContactList>(
        '/partners/tasks/customers',
        { params },
      );

      return data;
    },
    enabled: options?.enabled ?? true,
  });

export const usePartnerApplicantsQuery = (
  params?: PartnerApplicantsParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: partnerKeys.applicants(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<PartnerApplicantList>(
        '/partners/applications/applicants',
        { params: serializeApplicantsParams(params) },
      );

      return data;
    },
    enabled: options?.enabled ?? true,
  });

export const usePartnerApplicationCompaniesQuery = (
  params?: PartnerApplicationCompaniesParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: partnerKeys.applicationCompanies(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<PartnerApplicationCompanyList>(
        '/partners/applications/companies',
        { params },
      );

      return data;
    },
    enabled: options?.enabled ?? true,
  });
