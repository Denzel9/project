import { isValid } from 'date-fns';

import type {
  PartnerApplicationCompanyItem,
  PartnerProfile,
  PartnerUserItem,
} from './types';

const pickIsoDate = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string' || !value) continue;

    const date = new Date(value);

    if (isValid(date)) return value;
  }

  return undefined;
};

type RawPartnerUser = Partial<PartnerUserItem> & {
  user?: PartnerProfile;
  applicant?: PartnerProfile;
  tasksTotal?: number;
  lastActivityAt?: string;
  lastActivity?: string;
  updatedAt?: string;
};

type RawPartnerApplicationCompany = PartnerApplicationCompanyItem & {
  company?: PartnerProfile;
  lastActivityAt?: string;
  updatedAt?: string;
};

export const normalizePartnerUser = (item: RawPartnerUser): PartnerUserItem => {
  const profile = item.user ?? item.applicant ?? item;

  return {
    id: profile.id ?? item.id ?? '',
    role: profile.role ?? item.role ?? 'CREATOR',
    avatar: profile.avatar ?? item.avatar,
    bio: profile.bio ?? item.bio ?? null,
    name: profile.name ?? item.name,
    lastName: profile.lastName ?? item.lastName,
    companyName: profile.companyName ?? item.companyName,
    followers: item.followers ?? 0,
    interactionsCount: item.interactionsCount ?? item.tasksTotal ?? 0,
    lastInteractionAt:
      pickIsoDate(
        item.lastInteractionAt,
        item.lastActivityAt,
        item.lastActivity,
        item.updatedAt,
      ) ?? '',
  };
};

/** @deprecated use normalizePartnerUser */
export const normalizePartnerTaskContact = normalizePartnerUser;

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

export const mapPartnerUserToRow = (item: PartnerUserItem) => ({
  id: item.id,
  name: getPartnerName(item),
  avatar: item.avatar ?? undefined,
  kind: getPartnerKind(item),
  interactionsCount: item.interactionsCount,
  lastInteractionAt: item.lastInteractionAt || undefined,
});

/** @deprecated use mapPartnerUserToRow */
export const mapTaskContactToRow = mapPartnerUserToRow;

export const mapApplicationCompanyToRow = (item: PartnerApplicationCompanyItem) => ({
  id: item.id,
  name: getPartnerName(item),
  avatar: item.avatar ?? undefined,
  kind: 'COMPANY' as const,
  applicationsCount: item.applicationsCount,
  postsCount: item.postsCount ?? 0,
  lastActivityAt: item.lastApplicationAt || undefined,
});
