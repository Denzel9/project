import type { Post, PostDeliverable } from '@/entities/post'
import { getUsageRightsLabel } from '@/entities/post'
import type { Task } from '@/entities/task'

import {
  hasDeliverableValues,
  mapDeliverablesToForm,
} from './deliverablesMappers'
import type { TaskFormType } from './schema/schema'
import {
  composeTaskDescription,
  mapContentStylesToForm,
  parseTaskDescription,
} from './taskTzFields'

const VIDEO_FORMATS = new Set<PostDeliverable['format']>([
  'REELS',
  'SHORTS',
  'STORIES',
  'LIVE',
  'INTEGRATION',
])

const isEmpty = (value?: string | null) => !value?.trim()

const hasListValues = (items?: { value?: string }[]) =>
  Boolean(items?.some(item => !isEmpty(item.value)))

export const countMediaFromDeliverables = (
  deliverables?: PostDeliverable[],
): { photoCount: string; videoCount: string } => {
  let photos = 0
  let videos = 0

  deliverables?.forEach(item => {
    if (VIDEO_FORMATS.has(item.format)) {
      videos += item.count
    } else {
      photos += item.count
    }
  })

  return {
    photoCount: photos > 0 ? String(photos) : '',
    videoCount: videos > 0 ? String(videos) : '',
  }
}

export const mapPostToTaskDefaults = (post: Post): TaskFormType => {
  const { photoCount, videoCount } = countMediaFromDeliverables(
    post.deliverables,
  )

  return {
    title: post.title?.trim() ?? '',
    description: post.brief?.taskDescription?.trim() ?? '',
    dosAndDonts: post.brief?.dosAndDonts?.trim() ?? '',
    cta: post.brief?.cta?.trim() ?? '',
    brandGuidelinesUrl: post.brief?.brandGuidelinesUrl?.trim() ?? '',
    deliverables: mapDeliverablesToForm(post.deliverables),
    hashtagItems: post.brief?.hashtags?.map(value => ({ value })) ?? [],
    mentionItems: post.brief?.mentions?.map(value => ({ value })) ?? [],
    referenceItems: post.brief?.references?.map(value => ({ value })) ?? [],
    locationCountry: post.location?.country ?? '',
    locationCity: post.location?.city ?? '',
    locationAddress: post.location?.address ?? '',
    locationShootingRequired: post.location?.shootingRequired ?? false,
    cooperationExclusivity: post.cooperationDetails?.exclusivity ?? false,
    cooperationExclusivityDays:
      post.cooperationDetails?.exclusivityDays?.toString() ?? '',
    cooperationUsageRights: post.cooperationDetails?.usageRights
      ? getUsageRightsLabel(post.cooperationDetails.usageRights)
      : '',
    cooperationUsageDurationDays:
      post.cooperationDetails?.usageDurationDays?.toString() ?? '',
    cooperationRequiresMarking:
      post.cooperationDetails?.requiresMarking ?? false,
    cooperationRequiresContract:
      post.cooperationDetails?.requiresContract ?? false,
    cooperationNdaRequired: post.cooperationDetails?.ndaRequired ?? false,
    bloggerMinFollowers:
      post.bloggerRequirements?.minFollowers?.toString() ?? '',
    bloggerMaxFollowers:
      post.bloggerRequirements?.maxFollowers?.toString() ?? '',
    bloggerMinEngagementRate:
      post.bloggerRequirements?.minEngagementRate?.toString() ?? '',
    bloggerVerifiedAccount:
      post.bloggerRequirements?.verifiedAccount ?? false,
    bloggerExperienceWithAds:
      post.bloggerRequirements?.experienceWithAds ?? false,
    bloggerLanguages:
      post.bloggerRequirements?.languages?.map(value => ({ value })) ?? [],
    bloggerContentStyles: mapContentStylesToForm(
      post.bloggerRequirements?.contentStyle,
    ),
    photoCount,
    videoCount,
    finalDate: post.deadline ?? null,
  }
}

export const mapTaskToTaskForm = (task: Task): TaskFormType => ({
  title: task.title ?? '',
  photoCount: task.photoCount ?? '',
  videoCount: task.videoCount ?? '',
  finalDate: task.finalDate ?? null,
  ...parseTaskDescription(task.description),
})

export const hasUnsavedPostDefaults = (task: Task, post: Post): boolean => {
  const defaults = mapPostToTaskDefaults(post)
  const current = mapTaskToTaskForm(task)

  const hasDefaultTz =
    !isEmpty(defaults.description) ||
    !isEmpty(defaults.dosAndDonts) ||
    !isEmpty(defaults.cta) ||
    !isEmpty(defaults.brandGuidelinesUrl) ||
    hasDeliverableValues(defaults.deliverables) ||
    hasListValues(defaults.hashtagItems) ||
    hasListValues(defaults.mentionItems) ||
    hasListValues(defaults.referenceItems) ||
    !isEmpty(defaults.locationCountry) ||
    !isEmpty(defaults.locationCity) ||
    !isEmpty(defaults.locationAddress) ||
    defaults.locationShootingRequired ||
    defaults.cooperationExclusivity ||
    !isEmpty(defaults.cooperationExclusivityDays) ||
    !isEmpty(defaults.cooperationUsageRights) ||
    !isEmpty(defaults.cooperationUsageDurationDays) ||
    defaults.cooperationRequiresMarking ||
    defaults.cooperationRequiresContract ||
    defaults.cooperationNdaRequired ||
    !isEmpty(defaults.bloggerMinFollowers) ||
    !isEmpty(defaults.bloggerMaxFollowers) ||
    !isEmpty(defaults.bloggerMinEngagementRate) ||
    defaults.bloggerVerifiedAccount ||
    defaults.bloggerExperienceWithAds ||
    hasListValues(defaults.bloggerLanguages) ||
    hasListValues(defaults.bloggerContentStyles)

  const hasCurrentTz =
    !isEmpty(current.description) ||
    !isEmpty(composeTaskDescription(current))

  return (
    (isEmpty(task.title) && !isEmpty(defaults.title)) ||
    (!hasCurrentTz && hasDefaultTz) ||
    (isEmpty(task.photoCount) && !isEmpty(defaults.photoCount)) ||
    (isEmpty(task.videoCount) && !isEmpty(defaults.videoCount)) ||
    (!task.finalDate && Boolean(defaults.finalDate))
  )
}
export const buildTaskDescriptionFromPost = (post: Post): string =>
  composeTaskDescription(mapPostToTaskDefaults(post))

