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

export type PartnerTaskContactItem = {
  id: string;
  role: PartnerRole;
  avatar?: string | null;
  name?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  tasksTotal: number;
  tasksActive: number;
  lastActivityAt: string;
};

export type PartnerTaskContactList = {
  items: PartnerTaskContactItem[];
  total: number;
  page: number;
  limit: number;
};

export type PartnerApplicantItem = {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  postId: string;
  postTitle?: string | null;
  applicant: PartnerProfile;
};

export type PartnerApplicantList = {
  items: PartnerApplicantItem[];
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
  status?: TaskStatus;
  sort?: 'name' | 'recent' | 'tasks';
  q?: string;
  urgent?: boolean;
  page?: number;
  limit?: number;
};

export type PartnerApplicantsParams = {
  postId?: string;
  statuses?: ApplicationStatus[];
  q?: string;
  page?: number;
  limit?: number;
};

export type PartnerApplicationCompaniesParams = {
  sort?: 'recent' | 'name';
  q?: string;
  page?: number;
  limit?: number;
};
