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

const serializeStatusesParam = <T extends string>(statuses?: T[]) =>
  statuses?.length ? statuses.join(',') : undefined;

const serializeApplicantsParams = (params?: PartnerApplicantsParams) => {
  if (!params) return undefined;

  const { statuses, ...rest } = params;

  return {
    ...rest,
    ...(serializeStatusesParam(statuses)
      ? { statuses: serializeStatusesParam(statuses) }
      : {}),
  };
};

const serializeTaskContactsParams = (params?: PartnerTaskContactsParams) => {
  if (!params) return undefined;

  const { statuses, ...rest } = params;

  return {
    ...rest,
    ...(serializeStatusesParam(statuses)
      ? { statuses: serializeStatusesParam(statuses) }
      : {}),
  };
};

const serializeApplicationCompaniesParams = (
  params?: PartnerApplicationCompaniesParams,
) => {
  if (!params) return undefined;

  const { statuses, ...rest } = params;

  return {
    ...rest,
    ...(serializeStatusesParam(statuses)
      ? { statuses: serializeStatusesParam(statuses) }
      : {}),
  };
};

export const fetchPartnerExecutors = async (
  params?: PartnerTaskContactsParams,
  page = 1,
  limit = 20,
) => {
  const { data } = await mainAxios.get<PartnerTaskContactList>(
    '/partners/tasks/executors',
    { params: { ...serializeTaskContactsParams(params), page, limit } },
  );

  return data;
};

export const fetchPartnerCustomers = async (
  params?: PartnerTaskContactsParams,
  page = 1,
  limit = 20,
) => {
  const { data } = await mainAxios.get<PartnerTaskContactList>(
    '/partners/tasks/customers',
    { params: { ...serializeTaskContactsParams(params), page, limit } },
  );

  return data;
};

export const fetchPartnerApplicants = async (
  params?: PartnerApplicantsParams,
  page = 1,
  limit = 20,
) => {
  const { data } = await mainAxios.get<PartnerApplicantList>(
    '/partners/applications/applicants',
    { params: { ...serializeApplicantsParams(params), page, limit } },
  );

  return data;
};

export const fetchPartnerApplicationCompanies = async (
  params?: PartnerApplicationCompaniesParams,
  page = 1,
  limit = 20,
) => {
  const { data } = await mainAxios.get<PartnerApplicationCompanyList>(
    '/partners/applications/companies',
    { params: { ...serializeApplicationCompaniesParams(params), page, limit } },
  );

  return data;
};

export const usePartnerExecutorsQuery = (
  params?: PartnerTaskContactsParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: partnerKeys.executors(params),
    queryFn: () => fetchPartnerExecutors(params),
    enabled: options?.enabled ?? true,
  });

export const usePartnerCustomersQuery = (
  params?: PartnerTaskContactsParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: partnerKeys.customers(params),
    queryFn: () => fetchPartnerCustomers(params),
    enabled: options?.enabled ?? true,
  });

export const usePartnerApplicantsQuery = (
  params?: PartnerApplicantsParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: partnerKeys.applicants(params),
    queryFn: () => fetchPartnerApplicants(params),
    enabled: options?.enabled ?? true,
  });

export const usePartnerApplicationCompaniesQuery = (
  params?: PartnerApplicationCompaniesParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: partnerKeys.applicationCompanies(params),
    queryFn: () => fetchPartnerApplicationCompanies(params),
    enabled: options?.enabled ?? true,
  });
