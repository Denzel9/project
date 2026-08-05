import { mapDeliverablesToForm } from './deliverablesMappers'
import {
  mapBriefToTaskForm,
  mapBloggerRequirementsToTaskForm,
  mapCooperationDetailsToTaskForm,
  hasTaskFormTzContent,
} from './taskFormFieldMappers'

import type { TaskFormType } from './schema/schema'
import type { Post, PostDeliverable } from '@/entities/post'
import type { Task } from '@/entities/task'

const VIDEO_FORMATS = new Set<PostDeliverable['format']>([
  'REELS',
  'SHORTS',
  'STORIES',
  'LIVE',
  'INTEGRATION',
])

const isEmpty = (value?: string | null) => !value?.trim()

/** DB/API default is `"0"` — treat as unset for the form UI. */
export const normalizeMediaCount = (value?: string | null) => {
  if (!value?.trim()) return ''

  const count = Number(value)

  if (!Number.isFinite(count) || count <= 0) return ''

  return String(count)
}

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
    ...mapBriefToTaskForm(post.brief),
    deliverables: mapDeliverablesToForm(post.deliverables),
    ...mapCooperationDetailsToTaskForm(post.cooperationDetails),
    ...mapBloggerRequirementsToTaskForm(post.bloggerRequirements),
    photoCount,
    videoCount,
    finalDate: post.deadline ?? null,
  }
}

export const mapTaskToTaskForm = (task: Task): TaskFormType => ({
  title: task.title ?? '',
  description: task.description ?? '',
  photoCount: normalizeMediaCount(task.photoCount),
  videoCount: normalizeMediaCount(task.videoCount),
  finalDate: task.finalDate ?? null,
  ...mapBriefToTaskForm(task.brief),
  deliverables: mapDeliverablesToForm(task.deliverables ?? undefined),
  ...mapCooperationDetailsToTaskForm(task.cooperationDetails),
  ...mapBloggerRequirementsToTaskForm(task.bloggerRequirements),
})

export const hasUnsavedPostDefaults = (task: Task, post: Post): boolean => {
  const defaults = mapPostToTaskDefaults(post)
  const current = mapTaskToTaskForm(task)

  return (
    (isEmpty(task.title) && !isEmpty(defaults.title)) ||
    (!hasTaskFormTzContent(current) && hasTaskFormTzContent(defaults)) ||
    (isEmpty(normalizeMediaCount(task.photoCount)) &&
      !isEmpty(defaults.photoCount)) ||
    (isEmpty(normalizeMediaCount(task.videoCount)) &&
      !isEmpty(defaults.videoCount)) ||
    (!task.finalDate && Boolean(defaults.finalDate))
  )
}
