import { type PostListParams } from '@/entities/post';

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
  JSON.stringify(draft) !== JSON.stringify(defaultPostFilterDraft);

export const postFilterDraftToListParams = (
  draft: PostFilterDraft,
): Omit<PostListParams, 'page' | 'limit'> => {
  const title = trimOptional(draft.title);
  const urgent = parseTriState(draft.urgent);
  const createdDate = draft.createdAt || undefined;
  const deadlineDate = draft.deadline || undefined;
  const { budget, location, bloggerRequirements, cooperationDetails, brief, deliverables } =
    draft;

  const shootingRequired = parseTriState(location.shootingRequired);
  const verifiedAccount = parseTriState(bloggerRequirements.verifiedAccount);
  const experienceWithAds = parseTriState(bloggerRequirements.experienceWithAds);
  const exclusivity = parseTriState(cooperationDetails.exclusivity);
  const requiresMarking = parseTriState(cooperationDetails.requiresMarking);
  const requiresContract = parseTriState(cooperationDetails.requiresContract);
  const ndaRequired = parseTriState(cooperationDetails.ndaRequired);

  const minFollowers = parseOptionalNumber(bloggerRequirements.minFollowers);
  const maxFollowers = parseOptionalNumber(bloggerRequirements.maxFollowers);
  const minEngagementRate = parseOptionalNumber(
    bloggerRequirements.minEngagementRate,
  );
  const exclusivityDays = parseOptionalNumber(cooperationDetails.exclusivityDays);
  const usageDurationDays = parseOptionalNumber(
    cooperationDetails.usageDurationDays,
  );

  const locationCountry = trimOptional(location.country);
  const locationCity = trimOptional(location.city);
  const briefHashtag = brief.hashtags[0];
  const briefMention = brief.mentions[0];

  return {
    ...(title && { title }),
    ...(draft.chips.length > 0 && { chips: draft.chips }),
    ...(urgent !== undefined && { urgent }),
    ...(createdDate && { createdDate }),
    ...(draft.categories.length > 0 && { categories: draft.categories }),
    ...(draft.platforms.length > 0 && { platforms: draft.platforms }),
    ...(draft.placementFormats.length > 0 && {
      placementFormats: draft.placementFormats,
    }),
    ...(draft.niche.length > 0 && { niche: draft.niche }),
    ...(budget.type && { budgetType: budget.type }),
    ...(budget.currency && { budgetCurrency: budget.currency }),
    ...(budget.paymentTerms && { paymentTerms: budget.paymentTerms }),
    ...(deadlineDate && { deadlineDate }),
    ...(draft.workFormat && { workFormat: draft.workFormat }),
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
    ...(briefHashtag && { briefHashtag }),
    ...(briefMention && { briefMention }),
    ...(draft.tags.length > 0 && { tags: draft.tags }),
    ...(deliverables.platform && {
      deliverablePlatform: deliverables.platform,
    }),
    ...(deliverables.format && { deliverableFormat: deliverables.format }),
  };
};

export const fastFiltersToListParams = (
  filters: FILTERS_VALUES[],
  postFilters: PostFilterDraft = defaultPostFilterDraft,
): Partial<PostListParams> => {
  const params: Partial<PostListParams> = {};

  if (filters.includes(FILTERS_VALUES.TODAY) && !postFilters.createdAt) {
    params.createdDate = getTodayDate();
  }

  if (filters.includes(FILTERS_VALUES.REMOTE) && !postFilters.workFormat) {
    params.workFormat = 'REMOTE';
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
