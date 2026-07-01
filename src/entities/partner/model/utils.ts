import { isValid } from 'date-fns';

import type { PartnerApplicationCompanyItem, PartnerProfile, PartnerTaskContactItem } from './types';

const pickIsoDate = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string' || !value) continue;

    const date = new Date(value);

    if (isValid(date)) return value;
  }

  return undefined;
};

type RawPartnerTaskContact = PartnerTaskContactItem & {
  user?: PartnerProfile;
  lastActivity?: string;
  updatedAt?: string;
};

type RawPartnerApplicationCompany = PartnerApplicationCompanyItem & {
  company?: PartnerProfile;
  lastActivityAt?: string;
  updatedAt?: string;
};

export const normalizePartnerTaskContact = (
  item: RawPartnerTaskContact,
): PartnerTaskContactItem => {
  const profile = item.user ?? item;

  return {
    id: profile.id,
    role: profile.role,
    avatar: profile.avatar,
    name: profile.name,
    lastName: profile.lastName,
    companyName: profile.companyName,
    tasksTotal: item.tasksTotal ?? 0,
    tasksActive: item.tasksActive ?? 0,
    lastActivityAt:
      pickIsoDate(
        item.lastActivityAt,
        item.lastActivity,
        item.updatedAt,
      ) ?? '',
  };
};

export const normalizePartnerApplicationCompany = (
  item: RawPartnerApplicationCompany,
): PartnerApplicationCompanyItem => {
  const profile = item.company ?? item;

  return {
    id: profile.id,
    role: profile.role ?? 'COMPANY',
    avatar: profile.avatar,
    companyName: profile.companyName,
    name: profile.name,
    lastName: profile.lastName,
    applicationsCount: item.applicationsCount ?? 0,
    postsCount: item.postsCount,
    lastApplicationAt:
      pickIsoDate(
        item.lastApplicationAt,
        item.lastActivityAt,
        item.updatedAt,
      ) ?? '',
  };
};

export const getPartnerName = (profile?: Pick<
  PartnerProfile,
  'role' | 'name' | 'lastName' | 'companyName'
>) => {
  if (!profile) return 'Пользователь';

  if (profile.role === 'COMPANY') {
    return profile.companyName ?? 'Компания';
  }

  return [profile.name, profile.lastName].filter(Boolean).join(' ') || 'Креатор';
};

export const getPartnerKind = (
  profile: Pick<PartnerProfile, 'role'>,
): 'CREATOR' | 'COMPANY' => profile.role;

export const mapTaskContactToRow = (item: PartnerTaskContactItem) => ({
  id: item.id,
  name: getPartnerName(item),
  avatar: item.avatar ?? undefined,
  kind: getPartnerKind(item),
  tasksTotal: item.tasksTotal,
  tasksActive: item.tasksActive,
  lastActivityAt: item.lastActivityAt || undefined,
});

export const mapApplicationCompanyToRow = (item: PartnerApplicationCompanyItem) => ({
  id: item.id,
  name: getPartnerName(item),
  avatar: item.avatar ?? undefined,
  kind: 'COMPANY' as const,
  applicationsCount: item.applicationsCount,
  postsCount: item.postsCount ?? 0,
  lastActivityAt: item.lastApplicationAt || undefined,
});
