import { mapPostToTaskDefaults, mapTaskToTaskForm } from './postDefaults'
import {
  mapBriefFromTaskForm,
  mapBloggerRequirementsFromTaskForm,
  mapCooperationDetailsFromTaskForm,
  mapDeliverablesFromTaskForm,
} from './taskFormFieldMappers'

import type { TaskFormType } from './schema/schema'
import type { Post } from '@/entities/post'
import type { Task, UpdateTaskDto } from '@/entities/task'

export const mapTaskToForm = (task: Task): TaskFormType =>
  mapTaskToTaskForm(task)

export const mapPostToForm = (post: Post): TaskFormType =>
  mapPostToTaskDefaults(post)

export const mapFormToUpdateTask = (
  form: TaskFormType,
  isCompanyAction?: boolean,
): UpdateTaskDto => ({
  title: form.title,
  description: form.description?.trim() ?? '',
  photoCount: form.photoCount,
  videoCount: form.videoCount,
  finalDate: form.finalDate,
  bloggerRequirements: mapBloggerRequirementsFromTaskForm(form) ?? null,
  cooperationDetails: mapCooperationDetailsFromTaskForm(form) ?? null,
  brief: mapBriefFromTaskForm(form) ?? null,
  deliverables: mapDeliverablesFromTaskForm(form) ?? null,
  isCompanyAction,
})
