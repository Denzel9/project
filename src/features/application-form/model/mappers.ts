import {
  BudgetTypeEnum,
  formatPostDeadlineForApi,
  parsePostDeadlineForForm,
  type BloggerRequirements,
  type BudgetType,
  type ContentStyle,
  type CooperationDetails,
  type CreatePostDto,
  type PaymentTerms,
  type PlacementFormat,
  type Platform,
  type Post,
  type PostBrief,
  type PostBudget,
  type PostDeliverable,
  type PostLocation,
  type UpdatePostDto,
  type UsageRights,
  type WorkFormat,
} from '@/entities/post'

import type { FormProductType } from './schema/schema'

const parseNumber = (value?: string) => {
  if (!value?.trim()) return undefined

  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'))

  return Number.isNaN(parsed) ? undefined : parsed
}

const parseStringArray = (values?: (string | undefined)[]) =>
  values
    ?.map(item => item?.trim())
    .filter((item): item is string => Boolean(item)) ?? []

const mapBudgetFromForm = (form: FormProductType): PostBudget | undefined => {
  const type = form.budgetType as BudgetType

  const base = {
    type,
    ...(form.budgetCurrency && {
      currency: form.budgetCurrency as PostBudget['currency'],
    }),
    ...(form.paymentTerms && {
      paymentTerms: form.paymentTerms as PaymentTerms,
    }),
  }

  switch (type) {
    case BudgetTypeEnum.FIXED: {
      const amount = parseNumber(form.budgetAmount)

      if (amount == null && !form.paymentTerms) return undefined

      return amount != null ? { ...base, amount } : base
    }
    case BudgetTypeEnum.RANGE: {
      const minAmount = parseNumber(form.budgetMinAmount)
      const maxAmount = parseNumber(form.budgetMaxAmount)

      if (minAmount == null && maxAmount == null && !form.paymentTerms) {
        return undefined
      }

      return {
        ...base,
        ...(minAmount != null && { minAmount }),
        ...(maxAmount != null && { maxAmount }),
      }
    }
    case BudgetTypeEnum.BARTER: {
      if (!form.barterDescription?.trim()) return undefined

      return {
        ...base,
        barterDescription: form.barterDescription.trim(),
      }
    }
    case BudgetTypeEnum.NEGOTIABLE:
      return { type }
    default:
      return undefined
  }
}

const mapBudgetToForm = (budget?: PostBudget) => ({
  budgetType: budget?.type ?? BudgetTypeEnum.FIXED,
  budgetAmount: budget?.amount != null ? String(budget.amount) : '',
  budgetMinAmount: budget?.minAmount != null ? String(budget.minAmount) : '',
  budgetMaxAmount: budget?.maxAmount != null ? String(budget.maxAmount) : '',
  barterDescription: budget?.barterDescription ?? '',
  budgetCurrency: budget?.currency ?? 'RUB',
  paymentTerms: budget?.paymentTerms ?? '',
})

const mapLocationFromForm = (form: FormProductType): PostLocation | undefined => {
  const city = form.locationCity?.trim()
  const country = form.locationCountry?.trim()
  const address = form.locationAddress?.trim()

  const location: PostLocation = {
    ...(city && { city }),
    ...(country && { country }),
    ...(address && { address }),
    ...(form.shootingRequired && { shootingRequired: true }),
  }

  return Object.keys(location).length ? location : undefined
}

const mapLocationToForm = (location?: PostLocation) => ({
  locationCity: location?.city ?? '',
  locationCountry: location?.country ?? '',
  locationAddress: location?.address ?? '',
  shootingRequired: location?.shootingRequired ?? false,
})

const mapBloggerRequirementsFromForm = (
  form: FormProductType,
): BloggerRequirements | undefined => {
  const minFollowers = parseNumber(form.bloggerMinFollowers)
  const maxFollowers = parseNumber(form.bloggerMaxFollowers)
  const minEngagementRate = parseNumber(form.bloggerMinEngagementRate)
  const languages = parseStringArray(form.bloggerLanguages)
  const contentStyle = (form.bloggerContentStyle ?? []) as ContentStyle[]

  const requirements: BloggerRequirements = {
    ...(minFollowers != null && { minFollowers }),
    ...(maxFollowers != null && { maxFollowers }),
    ...(minEngagementRate != null && { minEngagementRate }),
    verifiedAccount: form.bloggerVerifiedAccount,
    experienceWithAds: form.bloggerExperienceWithAds,
    ...(languages.length > 0 && { languages }),
    ...(contentStyle.length > 0 && { contentStyle }),
  }

  const hasValue =
    minFollowers != null ||
    maxFollowers != null ||
    minEngagementRate != null ||
    form.bloggerVerifiedAccount ||
    form.bloggerExperienceWithAds ||
    languages.length > 0 ||
    contentStyle.length > 0

  return hasValue ? requirements : undefined
}

const mapBloggerRequirementsToForm = (
  requirements?: BloggerRequirements,
) => ({
  bloggerMinFollowers:
    requirements?.minFollowers != null
      ? String(requirements.minFollowers)
      : '',
  bloggerMaxFollowers:
    requirements?.maxFollowers != null
      ? String(requirements.maxFollowers)
      : '',
  bloggerMinEngagementRate:
    requirements?.minEngagementRate != null
      ? String(requirements.minEngagementRate)
      : '',
  bloggerVerifiedAccount: requirements?.verifiedAccount ?? false,
  bloggerExperienceWithAds: requirements?.experienceWithAds ?? false,
  bloggerLanguages: requirements?.languages ?? [],
  bloggerContentStyle: requirements?.contentStyle ?? [],
})

const mapCooperationDetailsFromForm = (
  form: FormProductType,
): CooperationDetails | undefined => {
  const exclusivityDays = parseNumber(form.coopExclusivityDays)
  const usageDurationDays = parseNumber(form.coopUsageDurationDays)

  const details: CooperationDetails = {
    exclusivity: form.coopExclusivity,
    ...(exclusivityDays != null && { exclusivityDays }),
    ...(form.coopUsageRights && {
      usageRights: form.coopUsageRights as UsageRights,
    }),
    ...(usageDurationDays != null && { usageDurationDays }),
    requiresMarking: form.coopRequiresMarking,
    requiresContract: form.coopRequiresContract,
    ndaRequired: form.coopNdaRequired,
  }

  const hasValue =
    form.coopExclusivity ||
    exclusivityDays != null ||
    Boolean(form.coopUsageRights) ||
    usageDurationDays != null ||
    form.coopRequiresMarking ||
    form.coopRequiresContract ||
    form.coopNdaRequired

  return hasValue ? details : undefined
}

const mapCooperationDetailsToForm = (details?: CooperationDetails) => ({
  coopExclusivity: details?.exclusivity ?? false,
  coopExclusivityDays:
    details?.exclusivityDays != null ? String(details.exclusivityDays) : '',
  coopUsageRights: details?.usageRights ?? '',
  coopUsageDurationDays:
    details?.usageDurationDays != null
      ? String(details.usageDurationDays)
      : '',
  coopRequiresMarking: details?.requiresMarking ?? false,
  coopRequiresContract: details?.requiresContract ?? false,
  coopNdaRequired: details?.ndaRequired ?? false,
})

const mapBriefFromForm = (form: FormProductType): PostBrief | undefined => {
  const brief = {
    ...(form.briefTaskDescription?.trim() && {
      taskDescription: form.briefTaskDescription.trim(),
    }),
    ...(form.briefReferences?.length && {
      references: parseStringArray(form.briefReferences),
    }),
    ...(form.briefBrandGuidelinesUrl?.trim() && {
      brandGuidelinesUrl: form.briefBrandGuidelinesUrl.trim(),
    }),
    ...(form.briefHashtags?.length && {
      hashtags: parseStringArray(form.briefHashtags),
    }),
    ...(form.briefMentions?.length && {
      mentions: parseStringArray(form.briefMentions),
    }),
    ...(form.briefCta?.trim() && { cta: form.briefCta.trim() }),
    ...(form.briefDosAndDonts?.trim() && {
      dosAndDonts: form.briefDosAndDonts.trim(),
    }),
  }

  return Object.keys(brief).length ? brief : undefined
}

const mapBriefToForm = (brief?: PostBrief) => ({
  briefTaskDescription: brief?.taskDescription ?? '',
  briefReferences: brief?.references ?? [],
  briefBrandGuidelinesUrl: brief?.brandGuidelinesUrl ?? '',
  briefHashtags: brief?.hashtags ?? [],
  briefMentions: brief?.mentions ?? [],
  briefCta: brief?.cta ?? '',
  briefDosAndDonts: brief?.dosAndDonts ?? '',
})

const mapDeliverablesFromForm = (
  form: FormProductType,
): PostDeliverable[] | undefined => {
  const deliverables = form.deliverables
    ?.map(item => {
      const count = parseNumber(item.count) ?? 1
      const durationSec = parseNumber(item.durationSec)

      return {
        platform: item.platform as Platform,
        format: item.format as PlacementFormat,
        count,
        ...(durationSec != null && { durationSec }),
      }
    })
    .filter(item => item.platform && item.format)

  return deliverables?.length ? deliverables : undefined
}

const mapDeliverablesToForm = (deliverables?: PostDeliverable[]) => ({
  deliverables: deliverables?.length
    ? deliverables.map(item => ({
        platform: item.platform,
        format: item.format,
        count: String(item.count),
        durationSec: item.durationSec != null ? String(item.durationSec) : '',
      }))
    : [],
})

const derivePlatformsFromDeliverables = (
  deliverables?: PostDeliverable[],
): Platform[] => [
  ...new Set(deliverables?.map(item => item.platform) ?? []),
]

const derivePlacementFormatsFromDeliverables = (
  deliverables?: PostDeliverable[],
): PlacementFormat[] => [
  ...new Set(deliverables?.map(item => item.format) ?? []),
]

export const mapFormToCreatePost = (form: FormProductType): CreatePostDto => {
  const chips = parseStringArray(form.chips)
  const keyWords = parseStringArray(form.keyWords)
  const categories = parseStringArray(form.categories)
  const tags = parseStringArray(form.tags)
  const niche = parseStringArray(form.niche)
  const deliverables = mapDeliverablesFromForm(form)
  const platforms = derivePlatformsFromDeliverables(deliverables)
  const placementFormats = derivePlacementFormatsFromDeliverables(deliverables)
  const budget = mapBudgetFromForm(form)

  return {
    title: form.title,
    ...(form.description?.trim() && { description: form.description.trim() }),
    urgent: form.urgent,
    isPrivate: form.isPrivate,
    workFormat: form.workFormat as WorkFormat,
    deadline: formatPostDeadlineForApi(form.deadline),
    ...(chips.length > 0 && { chips }),
    ...(keyWords.length > 0 && { keyWords }),
    ...(categories.length > 0 && { categories }),
    ...(tags.length > 0 && { tags }),
    ...(niche.length > 0 && { niche }),
    ...(platforms.length > 0 && { platforms }),
    ...(placementFormats.length > 0 && { placementFormats }),
    ...(budget && { budget }),
    location: mapLocationFromForm(form),
    bloggerRequirements: mapBloggerRequirementsFromForm(form),
    cooperationDetails: mapCooperationDetailsFromForm(form),
    brief: mapBriefFromForm(form),
    deliverables,
  }
}

export const mapFormToUpdatePost = (form: FormProductType): UpdatePostDto => ({
  ...mapFormToCreatePost(form),
})

export const mapPostToForm = (post: Post): Partial<FormProductType> => ({
  title: post.title,
  description: post.description,
  urgent: post.urgent,
  isPrivate: post.isPrivate ?? false,
  workFormat: post.workFormat ?? 'REMOTE',
  deadline: parsePostDeadlineForForm(post.deadline),
  chips: post.chips ?? [],
  keyWords: post.keyWords ?? [],
  categories: post.categories ?? [],
  tags: post.tags ?? [],
  niche: post.niche ?? [],
  ...mapBudgetToForm(post.budget),
  ...mapLocationToForm(post.location),
  ...mapBloggerRequirementsToForm(post.bloggerRequirements),
  ...mapCooperationDetailsToForm(post.cooperationDetails),
  ...mapBriefToForm(post.brief),
  ...mapDeliverablesToForm(post.deliverables),
})
