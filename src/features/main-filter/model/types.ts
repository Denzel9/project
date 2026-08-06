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
  shootingRequired: TriStateFilter;
};

export type PostFilterBloggerRequirements = {
  minFollowers: string;
  maxFollowers: string;
  minEngagementRate: string;
  verifiedAccount: TriStateFilter;
  experienceWithAds: TriStateFilter;
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

export type PostFilterDraft = {
  title: string;
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
  tags: string[];
  chips: string[];
};

const defaultBudget: PostFilterBudget = {
  type: '',
  currency: '',
  paymentTerms: '',
};

const defaultLocation: PostFilterLocation = {
  city: '',
  country: '',
  shootingRequired: '',
};

const defaultBloggerRequirements: PostFilterBloggerRequirements = {
  minFollowers: '',
  maxFollowers: '',
  minEngagementRate: '',
  verifiedAccount: '',
  experienceWithAds: '',
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

export const defaultPostFilterDraft: PostFilterDraft = {
  title: '',
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
  tags: [],
  chips: [],
};
