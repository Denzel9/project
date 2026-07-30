import type { ApplicationStatus } from '@/entities/application';
import type { TaskStatus } from '@/entities/task';

export type PartnerRole = 'CREATOR' | 'COMPANY';

export type PartnerProfile = {
  id: string;
  role: PartnerRole;
  avatar?: string | null;
  name?: string | null;
  lastName?: string | null;
  companyName?: string | null;
};

export type PartnerUserItem = {
  id: string;
  role: PartnerRole;
  avatar?: string | null;
  name?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  publicationsCount: number;
  interactionsCount: number;
  lastInteractionAt: string;
};

/** @deprecated use PartnerUserItem */
export type PartnerTaskContactItem = PartnerUserItem;

export type PartnerTaskContactList = {
  items: PartnerUserItem[];
  total: number;
  page: number;
  limit: number;
};

/** @deprecated use PartnerUserItem */
export type PartnerApplicantItem = PartnerUserItem;

export type PartnerApplicantList = {
  items: PartnerUserItem[];
  total: number;
  page: number;
  limit: number;
};

export type PartnerApplicationCompanyItem = {
  id: string;
  role: PartnerRole;
  avatar?: string | null;
  companyName?: string | null;
  name?: string | null;
  lastName?: string | null;
  applicationsCount: number;
  lastApplicationAt: string;
  postsCount?: number;
};

export type PartnerApplicationCompanyList = {
  items: PartnerApplicationCompanyItem[];
  total: number;
  page: number;
  limit: number;
};

export type PartnerTaskContactsParams = {
  q?: string
  postId?: string
  taskId?: string
  userId?: string
  status?: TaskStatus
  statuses?: TaskStatus[]
  createdDate?: string
  isExecutorApprove?: boolean | null
  urgent?: boolean
  sort?: 'name' | 'recent'
  page?: number
  limit?: number
}

export type PartnerApplicantsParams = {
  q?: string;
  postId?: string;
  userId?: string;
  status?: ApplicationStatus;
  statuses?: ApplicationStatus[];
  createdDate?: string;
  sort?: 'recent' | 'name';
  page?: number;
  limit?: number;
};

export type PartnerApplicationCompaniesParams = {
  q?: string;
  postId?: string;
  userId?: string;
  status?: ApplicationStatus;
  statuses?: ApplicationStatus[];
  createdDate?: string;
  sort?: 'recent' | 'name';
  page?: number;
  limit?: number;
};
