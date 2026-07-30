export type ContactKind = 'CREATOR' | 'COMPANY';

export type TaskContactRow = {
  id: string;
  name: string;
  avatar?: string;
  kind: ContactKind;
  publicationsCount: number;
  interactionsCount: number;
  lastInteractionAt?: string;
};

export type TaskContactSortField =
  | 'name'
  | 'interactionsCount'
  | 'publicationsCount'
  | 'lastInteractionAt';

export type ApplicationCompanyRow = {
  id: string;
  name: string;
  avatar?: string;
  applicationsCount: number;
  postsCount: number;
  lastActivityAt?: string;
};

export type ApplicationCompanySortField =
  | 'name'
  | 'applicationsCount'
  | 'postsCount'
  | 'lastActivityAt';

export type PartnersSortOrder = 'asc' | 'desc';

export type PartnersTabId =
  | 'executors'
  | 'applicants'
  | 'customers'
  | 'companies';

export type PartnersTab = {
  id: PartnersTabId;
  label: string;
};

export type PartnersPageConfig = {
  title: string;
  tabs: PartnersTab[];
  defaultTab: PartnersTabId;
};
