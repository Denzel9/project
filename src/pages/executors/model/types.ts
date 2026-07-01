export type ContactKind = 'CREATOR' | 'COMPANY';

export type TaskContactRow = {
  id: string;
  name: string;
  avatar?: string;
  kind: ContactKind;
  tasksTotal: number;
  tasksActive: number;
  lastActivityAt?: string;
};

export type ApplicationCompanyRow = {
  id: string;
  name: string;
  avatar?: string;
  applicationsCount: number;
  postsCount: number;
  lastActivityAt?: string;
};

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
