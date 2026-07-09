import {
  CONTENT_STYLE_LABELS,
  USAGE_RIGHTS_LABELS,
  type BloggerRequirements,
  type ContentStyle,
  type CooperationDetails,
  type PlacementFormat,
  type Platform,
  type PostBrief,
  type PostDeliverable,
  type UsageRights,
} from '@/entities/post'

import { mapContentStylesToForm, mapUsageRightsToForm } from './taskTzFields'

import type { TaskFormType } from './schema/schema'

const parseNumber = (value?: string) => {
  if (!value?.trim()) return undefined

  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'))

  return Number.isNaN(parsed) ? undefined : parsed
}

const parseListItems = (items?: { value?: string }[]) =>
  items
    ?.map(item => item.value?.trim())
    .filter((value): value is string => Boolean(value)) ?? []

const findUsageRightsByLabel = (label: string): UsageRights | null => {
  const normalized = label.trim()
  const entry = Object.entries(USAGE_RIGHTS_LABELS).find(
    ([, value]) => value === normalized,
  )

  return entry ? (entry[0] as UsageRights) : null
}

const parseContentStylesFromForm = (
  items?: { value?: string }[],
): ContentStyle[] =>
  parseListItems(items)
    .map(label => {
      const entry = Object.entries(CONTENT_STYLE_LABELS).find(
        ([, value]) => value === label,
      )

      return entry ? (entry[0] as ContentStyle) : null
    })
    .filter((style): style is ContentStyle => style !== null)

export const mapBriefFromTaskForm = (
  form: TaskFormType,
): PostBrief | undefined => {
  const hashtags = parseListItems(form.hashtagItems)
  const mentions = parseListItems(form.mentionItems)
  const references = parseListItems(form.referenceItems)

  const brief: PostBrief = {
    ...(form.dosAndDonts?.trim() && { dosAndDonts: form.dosAndDonts.trim() }),
    ...(form.cta?.trim() && { cta: form.cta.trim() }),
    ...(form.brandGuidelinesUrl?.trim() && {
      brandGuidelinesUrl: form.brandGuidelinesUrl.trim(),
    }),
    ...(hashtags.length > 0 && { hashtags }),
    ...(mentions.length > 0 && { mentions }),
    ...(references.length > 0 && { references }),
  }

  return Object.keys(brief).length ? brief : undefined
}

export const mapBriefToTaskForm = (brief?: PostBrief | null) => ({
  dosAndDonts: brief?.dosAndDonts ?? '',
  cta: brief?.cta ?? '',
  brandGuidelinesUrl: brief?.brandGuidelinesUrl ?? '',
  hashtagItems: brief?.hashtags?.map(value => ({ value })) ?? [],
  mentionItems: brief?.mentions?.map(value => ({ value })) ?? [],
  referenceItems: brief?.references?.map(value => ({ value })) ?? [],
})

export const mapCooperationDetailsFromTaskForm = (
  form: TaskFormType,
): CooperationDetails | undefined => {
  const exclusivityDays = parseNumber(form.cooperationExclusivityDays)
  const usageDurationDays = parseNumber(form.cooperationUsageDurationDays)
  const usageRights = form.cooperationUsageRights?.trim()
    ? findUsageRightsByLabel(form.cooperationUsageRights)
    : null

  const details: CooperationDetails = {
    exclusivity: form.cooperationExclusivity,
    ...(exclusivityDays != null && { exclusivityDays }),
    ...(usageRights && { usageRights }),
    ...(usageDurationDays != null && { usageDurationDays }),
    requiresMarking: form.cooperationRequiresMarking,
    requiresContract: form.cooperationRequiresContract,
    ndaRequired: form.cooperationNdaRequired,
  }

  const hasValue =
    form.cooperationExclusivity ||
    exclusivityDays != null ||
    Boolean(usageRights) ||
    usageDurationDays != null ||
    form.cooperationRequiresMarking ||
    form.cooperationRequiresContract ||
    form.cooperationNdaRequired

  return hasValue ? details : undefined
}

export const mapCooperationDetailsToTaskForm = (
  details?: CooperationDetails | null,
) => ({
  cooperationExclusivity: details?.exclusivity ?? false,
  cooperationExclusivityDays:
    details?.exclusivityDays != null ? String(details.exclusivityDays) : '',
  cooperationUsageRights: mapUsageRightsToForm(details?.usageRights),
  cooperationUsageDurationDays:
    details?.usageDurationDays != null
      ? String(details.usageDurationDays)
      : '',
  cooperationRequiresMarking: details?.requiresMarking ?? false,
  cooperationRequiresContract: details?.requiresContract ?? false,
  cooperationNdaRequired: details?.ndaRequired ?? false,
})

export const mapBloggerRequirementsFromTaskForm = (
  form: TaskFormType,
): BloggerRequirements | undefined => {
  const minFollowers = parseNumber(form.bloggerMinFollowers)
  const maxFollowers = parseNumber(form.bloggerMaxFollowers)
  const minEngagementRate = parseNumber(form.bloggerMinEngagementRate)
  const languages = parseListItems(form.bloggerLanguages)
  const contentStyle = parseContentStylesFromForm(form.bloggerContentStyles)

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

export const mapBloggerRequirementsToTaskForm = (
  requirements?: BloggerRequirements | null,
) => ({
  bloggerMinFollowers:
    requirements?.minFollowers != null ? String(requirements.minFollowers) : '',
  bloggerMaxFollowers:
    requirements?.maxFollowers != null ? String(requirements.maxFollowers) : '',
  bloggerMinEngagementRate:
    requirements?.minEngagementRate != null
      ? String(requirements.minEngagementRate)
      : '',
  bloggerVerifiedAccount: requirements?.verifiedAccount ?? false,
  bloggerExperienceWithAds: requirements?.experienceWithAds ?? false,
  bloggerLanguages:
    requirements?.languages?.map(value => ({ value })) ?? [],
  bloggerContentStyles: mapContentStylesToForm(requirements?.contentStyle),
})

export const mapDeliverablesFromTaskForm = (
  form: TaskFormType,
): PostDeliverable[] | undefined => {
  const deliverables = form.deliverables
    ?.map(item => {
      const count = parseNumber(item.count) ?? 1
      const durationSec = parseNumber(item.durationSec)

      if (!item.platform || !item.format) return null

      return {
        platform: item.platform as Platform,
        format: item.format as PlacementFormat,
        count,
        ...(durationSec != null && { durationSec }),
      }
    })
    .filter((item): item is PostDeliverable => item !== null)

  return deliverables?.length ? deliverables : undefined
}

const isEmpty = (value?: string | null) => !value?.trim()

const hasListValues = (items?: { value?: string }[]) =>
  Boolean(items?.some(item => !isEmpty(item.value)))

export const hasTaskFormTzContent = (form: TaskFormType): boolean =>
  !isEmpty(form.description) ||
  !isEmpty(form.dosAndDonts) ||
  !isEmpty(form.cta) ||
  !isEmpty(form.brandGuidelinesUrl) ||
  Boolean(form.deliverables?.some(item => item.platform && item.format)) ||
  hasListValues(form.hashtagItems) ||
  hasListValues(form.mentionItems) ||
  hasListValues(form.referenceItems) ||
  form.cooperationExclusivity ||
  !isEmpty(form.cooperationExclusivityDays) ||
  !isEmpty(form.cooperationUsageRights) ||
  !isEmpty(form.cooperationUsageDurationDays) ||
  form.cooperationRequiresMarking ||
  form.cooperationRequiresContract ||
  form.cooperationNdaRequired ||
  !isEmpty(form.bloggerMinFollowers) ||
  !isEmpty(form.bloggerMaxFollowers) ||
  !isEmpty(form.bloggerMinEngagementRate) ||
  form.bloggerVerifiedAccount ||
  form.bloggerExperienceWithAds ||
  hasListValues(form.bloggerLanguages) ||
  hasListValues(form.bloggerContentStyles)
