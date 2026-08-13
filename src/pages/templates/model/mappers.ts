import { mapDeliverablesToForm } from '@/features/task-form/model/deliverablesMappers'
import { normalizeMediaCount } from '@/features/task-form/model/postDefaults'
import {
  mapBriefFromTaskForm,
  mapBriefToTaskForm,
  mapBloggerRequirementsFromTaskForm,
  mapBloggerRequirementsToTaskForm,
  mapCooperationDetailsFromTaskForm,
  mapCooperationDetailsToTaskForm,
  mapDeliverablesFromTaskForm,
} from '@/features/task-form/model/taskFormFieldMappers'
import { defaultValues, type TaskFormType } from '@/features/task-form/model/schema/schema'

import type { CreateTaskTemplateDto, TaskTemplate } from '@/entities'

export const mapTaskTemplateToForm = (
  template?: TaskTemplate | null,
): TaskFormType => {
  if (!template) return defaultValues

  return {
    title: template.title ?? '',
    description: template.description ?? '',
    photoCount: normalizeMediaCount(template.photoCount),
    videoCount: normalizeMediaCount(template.videoCount),
    finalDate: template.finalDate ?? null,
    ...mapBriefToTaskForm(template.brief),
    deliverables: mapDeliverablesToForm(template.deliverables ?? undefined),
    ...mapCooperationDetailsToTaskForm(template.cooperationDetails),
    ...mapBloggerRequirementsToTaskForm(template.bloggerRequirements),
  }
}

export const mapFormToTaskTemplateBody = (
  name: string,
  form: TaskFormType,
  urgent: boolean,
): CreateTaskTemplateDto => ({
  name,
  title: form.title.trim() || null,
  description: form.description?.trim() ?? '',
  photoCount: form.photoCount || '0',
  videoCount: form.videoCount || '0',
  urgent,
  finalDate: form.finalDate || null,
  bloggerRequirements: mapBloggerRequirementsFromTaskForm(form) ?? null,
  cooperationDetails: mapCooperationDetailsFromTaskForm(form) ?? null,
  brief: mapBriefFromTaskForm(form) ?? null,
  deliverables: mapDeliverablesFromTaskForm(form) ?? null,
})
