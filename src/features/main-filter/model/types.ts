import type {
  BudgetType,
  ContentStyle,
  PaymentTerms,
  PlacementFormat,
  Platform,
  PostCurrency,
  UsageRights,
  WorkFormat,
} from '@/entities/post';

export type TriStateFilter = '' | 'true' | 'false';

export type PostFilterBudget = {
  type: BudgetType | '';
  currency: PostCurrency | '';
  paymentTerms: PaymentTerms | '';
};

export type PostFilterLocation = {
  city: string;
  country: string;
  address: string;
  shootingRequired: TriStateFilter;
};

export type PostFilterBloggerRequirements = {
  minFollowers: string;
  maxFollowers: string;
  minEngagementRate: string;
  verifiedAccount: TriStateFilter;
  experienceWithAds: TriStateFilter;
  languages: string[];
  contentStyle: ContentStyle[];
};

export type PostFilterCooperationDetails = {
  exclusivity: TriStateFilter;
  exclusivityDays: string;
  usageRights: UsageRights | '';
  usageDurationDays: string;
  requiresMarking: TriStateFilter;
  requiresContract: TriStateFilter;
  ndaRequired: TriStateFilter;
};

export type PostFilterBrief = {
  hashtags: string[];
  mentions: string[];
};

export type PostFilterDeliverable = {
  platform: Platform | '';
  format: PlacementFormat | '';
};

export type PostFilterDraft = {
  title: string;
  chips: string[];
  urgent: TriStateFilter;
  createdAt: string;
  categories: string[];
  platforms: Platform[];
  placementFormats: PlacementFormat[];
  niche: string[];
  budget: PostFilterBudget;
  deadline: string;
  workFormat: WorkFormat | '';
  location: PostFilterLocation;
  bloggerRequirements: PostFilterBloggerRequirements;
  cooperationDetails: PostFilterCooperationDetails;
  brief: PostFilterBrief;
  tags: string[];
  deliverables: PostFilterDeliverable;
};

const defaultBudget: PostFilterBudget = {
  type: '',
  currency: '',
  paymentTerms: '',
};

const defaultLocation: PostFilterLocation = {
  city: '',
  country: '',
  address: '',
  shootingRequired: '',
};

const defaultBloggerRequirements: PostFilterBloggerRequirements = {
  minFollowers: '',
  maxFollowers: '',
  minEngagementRate: '',
  verifiedAccount: '',
  experienceWithAds: '',
  languages: [],
  contentStyle: [],
};

const defaultCooperationDetails: PostFilterCooperationDetails = {
  exclusivity: '',
  exclusivityDays: '',
  usageRights: '',
  usageDurationDays: '',
  requiresMarking: '',
  requiresContract: '',
  ndaRequired: '',
};

const defaultBrief: PostFilterBrief = {
  hashtags: [],
  mentions: [],
};

const defaultDeliverables: PostFilterDeliverable = {
  platform: '',
  format: '',
};

export const defaultPostFilterDraft: PostFilterDraft = {
  title: '',
  chips: [],
  urgent: '',
  createdAt: '',
  categories: [],
  platforms: [],
  placementFormats: [],
  niche: [],
  budget: defaultBudget,
  deadline: '',
  workFormat: '',
  location: defaultLocation,
  bloggerRequirements: defaultBloggerRequirements,
  cooperationDetails: defaultCooperationDetails,
  brief: defaultBrief,
  tags: [],
  deliverables: defaultDeliverables,
};
