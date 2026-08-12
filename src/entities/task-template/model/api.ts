import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'
import { taskKeys } from '@/entities/task'

import type {
  CreateTaskTemplateDto,
  InstantiateTaskTemplateDto,
  TaskTemplate,
  UpdateTaskTemplateDto,
} from './types'
import type { Task } from '@/entities/task'

export const taskTemplateKeys = {
  all: ['task-templates'] as const,
  list: () => [...taskTemplateKeys.all, 'list'] as const,
  detail: (id: string) => [...taskTemplateKeys.all, 'detail', id] as const,
}

export const fetchTaskTemplates = async () => {
  const { data } = await mainAxios.get<TaskTemplate[]>('/task-templates')
  return data
}

export const useTaskTemplatesQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: taskTemplateKeys.list(),
    queryFn: fetchTaskTemplates,
    enabled: options?.enabled ?? true,
  })

export const useCreateTaskTemplateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateTaskTemplateDto) => {
      const { data } = await mainAxios.post<TaskTemplate>(
        '/task-templates',
        body,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskTemplateKeys.all })
    },
  })
}

export const useCreateTaskTemplateFromTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data } = await mainAxios.post<TaskTemplate>(
        `/task-templates/from-task/${taskId}`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskTemplateKeys.all })
    },
  })
}

export const useUpdateTaskTemplateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: UpdateTaskTemplateDto
    }) => {
      const { data } = await mainAxios.patch<TaskTemplate>(
        `/task-templates/${id}`,
        body,
      )
      return data
    },
    onSuccess: template => {
      void queryClient.invalidateQueries({ queryKey: taskTemplateKeys.all })
      queryClient.setQueryData(taskTemplateKeys.detail(template.id), template)
    },
  })
}

export const useDeleteTaskTemplateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await mainAxios.delete(`/task-templates/${id}`)
      return id
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskTemplateKeys.all })
    },
  })
}

export const useInstantiateTaskTemplateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: InstantiateTaskTemplateDto
    }) => {
      const { data } = await mainAxios.post<Task>(
        `/task-templates/${id}/instantiate`,
        body,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
