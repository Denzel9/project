import { type PostListParams } from '@/entities/post';
import { USER_ROLE } from '@/entities/user';

import { FILTERS_VALUES } from './constants';
import {
  defaultPostFilterDraft,
  type PostFilterDraft,
  type TriStateFilter,
} from './types';

const parseTriState = (value: TriStateFilter): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;

  return undefined;
};

const parseOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim();

  if (!trimmed) return undefined;

  const num = Number(trimmed);

  return Number.isFinite(num) ? num : undefined;
};

const trimOptional = (value: string): string | undefined => {
  const trimmed = value.trim();

  return trimmed || undefined;
};

const getTodayDate = (): string => new Date().toISOString().slice(0, 10);

export const hasActivePostFilters = (draft: PostFilterDraft): boolean =>
  JSON.stringify(normalizePostFilterDraft(draft)) !==
  JSON.stringify(defaultPostFilterDraft);

export const normalizePostFilterDraft = (
  draft: Partial<PostFilterDraft> | PostFilterDraft,
): PostFilterDraft => ({
  ...defaultPostFilterDraft,
  ...draft,
  chips: draft.chips ?? [],
  categories: draft.categories ?? [],
  tags: draft.tags ?? [],
  niche: draft.niche ?? [],
  platforms: draft.platforms ?? [],
  placementFormats: draft.placementFormats ?? [],
  budget: {
    ...defaultPostFilterDraft.budget,
    ...draft.budget,
  },
  location: {
    ...defaultPostFilterDraft.location,
    ...draft.location,
  },
  bloggerRequirements: {
    ...defaultPostFilterDraft.bloggerRequirements,
    ...draft.bloggerRequirements,
    contentStyle: draft.bloggerRequirements?.contentStyle ?? [],
  },
  cooperationDetails: {
    ...defaultPostFilterDraft.cooperationDetails,
    ...draft.cooperationDetails,
  },
});

/** COMPANY looks at creator posts; CREATOR looks at company ads. */
export const sanitizePostFilterDraftForRole = (
  draft: PostFilterDraft,
  role: USER_ROLE | string | null | undefined,
): PostFilterDraft => {
  const normalized = normalizePostFilterDraft(draft);

  if (role === USER_ROLE.COMPANY) {
    return {
      ...defaultPostFilterDraft,
      title: normalized.title,
      createdAt: normalized.createdAt,
      categories: normalized.categories,
      tags: normalized.tags,
      niche: normalized.niche,
      chips: normalized.chips,
      platforms: normalized.platforms,
      workFormat: normalized.workFormat,
      employmentType: normalized.employmentType,
      budget: normalized.budget,
      location: {
        city: normalized.location.city,
        country: normalized.location.country,
        shootingRequired: '',
      },
    };
  }

  if (role === USER_ROLE.CREATOR) {
    return {
      ...normalized,
      chips: [],
    };
  }

  return normalized;
};

export const postFilterDraftToListParams = (
  draft: PostFilterDraft,
): Omit<PostListParams, 'page' | 'limit'> => {
  const title = trimOptional(draft.title);
  const urgent = parseTriState(draft.urgent);
  const createdDate = draft.createdAt || undefined;
  const deadlineDate = draft.deadline || undefined;
  const { budget, location, bloggerRequirements, cooperationDetails } = draft;

  const shootingRequired = parseTriState(location.shootingRequired);
  const verifiedAccount = parseTriState(bloggerRequirements.verifiedAccount);
  const experienceWithAds = parseTriState(
    bloggerRequirements.experienceWithAds,
  );
  const exclusivity = parseTriState(cooperationDetails.exclusivity);
  const requiresMarking = parseTriState(cooperationDetails.requiresMarking);
  const requiresContract = parseTriState(cooperationDetails.requiresContract);
  const ndaRequired = parseTriState(cooperationDetails.ndaRequired);

  const minFollowers = parseOptionalNumber(bloggerRequirements.minFollowers);
  const maxFollowers = parseOptionalNumber(bloggerRequirements.maxFollowers);
  const minEngagementRate = parseOptionalNumber(
    bloggerRequirements.minEngagementRate,
  );
  const exclusivityDays = parseOptionalNumber(
    cooperationDetails.exclusivityDays,
  );
  const usageDurationDays = parseOptionalNumber(
    cooperationDetails.usageDurationDays,
  );

  const locationCountry = trimOptional(location.country);
  const locationCity = trimOptional(location.city);

  return {
    ...(title && { title }),
    ...(urgent !== undefined && { urgent }),
    ...(createdDate && { createdDate }),
    ...(draft.categories.length > 0 && { categories: draft.categories }),
    ...(draft.platforms.length > 0 && { platforms: draft.platforms }),
    ...(draft.placementFormats.length > 0 && {
      placementFormats: draft.placementFormats,
    }),
    ...(draft.niche.length > 0 && { niche: draft.niche }),
    ...(draft.chips.length > 0 && { chips: draft.chips }),
    ...(budget.type && { budgetType: budget.type }),
    ...(budget.currency && { budgetCurrency: budget.currency }),
    ...(budget.paymentTerms && { paymentTerms: budget.paymentTerms }),
    ...(deadlineDate && { deadlineDate }),
    ...(draft.workFormat && { workFormat: draft.workFormat }),
    ...(draft.employmentType && { employmentType: draft.employmentType }),
    ...(locationCountry && { locationCountry }),
    ...(locationCity && { locationCity }),
    ...(shootingRequired !== undefined && { shootingRequired }),
    ...(minFollowers !== undefined && { minFollowers }),
    ...(maxFollowers !== undefined && { maxFollowers }),
    ...(minEngagementRate !== undefined && { minEngagementRate }),
    ...(bloggerRequirements.contentStyle.length > 0 && {
      contentStyle: bloggerRequirements.contentStyle,
    }),
    ...(verifiedAccount !== undefined && { verifiedAccount }),
    ...(experienceWithAds !== undefined && { experienceWithAds }),
    ...(exclusivity !== undefined && { exclusivity }),
    ...(exclusivityDays !== undefined && { exclusivityDays }),
    ...(cooperationDetails.usageRights && {
      usageRights: cooperationDetails.usageRights,
    }),
    ...(usageDurationDays !== undefined && { usageDurationDays }),
    ...(requiresMarking !== undefined && { requiresMarking }),
    ...(requiresContract !== undefined && { requiresContract }),
    ...(ndaRequired !== undefined && { ndaRequired }),
    ...(draft.tags.length > 0 && { tags: draft.tags }),
  };
};

export const fastFiltersToListParams = (
  filters: FILTERS_VALUES[],
  postFilters: PostFilterDraft = defaultPostFilterDraft
): Partial<PostListParams> => {
  const params: Partial<PostListParams> = {};

  if (filters.includes(FILTERS_VALUES.TODAY) && !postFilters.createdAt) {
    params.createdDate = getTodayDate();
  }

  if (filters.includes(FILTERS_VALUES.REMOTE) && !postFilters.workFormat) {
    params.workFormat = 'REMOTE';
  }

  if (filters.includes(FILTERS_VALUES.WITH_PHOTO)) {
    params.hasPhoto = true;
  }

  return params;
};

export const toPostListParams = (options?: {
  filters?: FILTERS_VALUES[];
  postFilters?: PostFilterDraft;
  pagination?: { page?: number; limit?: number };
}): PostListParams => {
  const {
    filters = [],
    postFilters = defaultPostFilterDraft,
    pagination,
  } = options ?? {};

  return {
    page: pagination?.page ?? 1,
    limit: pagination?.limit ?? 20,
    ...postFilterDraftToListParams(postFilters),
    ...fastFiltersToListParams(filters, postFilters),
  };
};

export const toPostInfiniteListParams = (options?: {
  filters?: FILTERS_VALUES[];
  postFilters?: PostFilterDraft;
  limit?: number;
}): Omit<PostListParams, 'page'> => {
  const {
    filters = [],
    postFilters = defaultPostFilterDraft,
    limit = 20,
  } = options ?? {};

  return {
    limit,
    ...postFilterDraftToListParams(postFilters),
    ...fastFiltersToListParams(filters, postFilters),
  };
};
