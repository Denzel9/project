import type { TaskFormType } from './schema/schema'
import type { Task, UpdateTaskDto } from '@/entities/task'

export const mapTaskToForm = (task: Task): TaskFormType => ({
  description: task.description,
  photoCount: task.photoCount,
  videoCount: task.videoCount,
  finalDate: task.finalDate,
})

export const mapFormToUpdateTask = (
  form: TaskFormType,
): Pick<UpdateTaskDto, 'description' | 'photoCount' | 'videoCount' | 'finalDate'> => ({
  description: form.description,
  photoCount: form.photoCount,
  videoCount: form.videoCount,
  finalDate: form.finalDate,
})
