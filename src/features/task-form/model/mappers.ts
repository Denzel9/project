import type { Post } from '@/entities/post'
import type { Task, UpdateTaskDto } from '@/entities/task'

import { mapPostToTaskDefaults, mapTaskToTaskForm } from './postDefaults'
import { composeTaskDescription } from './taskTzFields'
import type { TaskFormType } from './schema/schema'

export const mapTaskToForm = (task: Task): TaskFormType =>
  mapTaskToTaskForm(task)

export const mapPostToForm = (post: Post): TaskFormType =>
  mapPostToTaskDefaults(post)

export const mapFormToUpdateTask = (
  form: TaskFormType,
  isCompanyAction?: boolean,
): UpdateTaskDto => ({
  title: form.title,
  description: composeTaskDescription(form),
  photoCount: form.photoCount,
  videoCount: form.videoCount,
  finalDate: form.finalDate,
  isCompanyAction: isCompanyAction,
})
