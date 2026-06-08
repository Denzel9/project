import { useMutation, useQuery } from "@tanstack/react-query";

import { mainAxios } from "@/shared/api";

import type { Application, } from "../types/types";

export const useCreateApplicationMutation = () => useMutation({
  mutationFn: async (data: Application) => await mainAxios.post<Application>('applications', data),
});

export const useUpdateApplicationMutation = () => useMutation({
  mutationFn: async (data: Application) => await mainAxios.put<Application>('applications', data),
});

export const useDeleteApplicationMutation = () => useMutation({
  mutationFn: async (id: string) => await mainAxios.delete<Application>(`applications/${id}`),
});

export const useGetAllApplicationsQuery = () => useQuery({
  queryKey: ['applications'],
  queryFn: async () => await mainAxios.get<Application[]>('applications'),
});

export const useGetApplicationByIdQuery = (id: string) => useQuery({
  queryKey: ['applications', id],
  queryFn: async () => await mainAxios.get<Application>(`applications/${id}`),
});


export const useGetApplicationCategoriesQuery = () => useQuery({
  queryKey: ['applicationCategories'],
  queryFn: async () => await mainAxios.get<Application[]>('applications/categories'),
});
