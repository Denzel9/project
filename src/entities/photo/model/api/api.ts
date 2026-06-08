import { useMutation, useQuery } from "@tanstack/react-query";

import { mainAxios } from "@/shared/api";

import type { GetMultipleFilesResponse, GetPhotoUploadResponse, PhotoUploadParams, PhotoUploadResponse } from "../types/types";

export const useUploadFileMutation = () => useMutation({
    mutationKey: ['uploadFile'],
    mutationFn: async (data: PhotoUploadParams) => await mainAxios.post<PhotoUploadResponse>('files/upload', data),
});

export const useDeleteFileMutation = () => useMutation({
    mutationKey: ['deleteFile'],
    mutationFn: async (data: { keys: string[] }) => await mainAxios.delete<void>('files', { data }),
});

export const useGetFilesQuery = () => useQuery({
    queryKey: ['files'],
    queryFn: async () => await mainAxios.get<GetPhotoUploadResponse>('files/uploads'),
});

export const useGetMultipleFilesQuery = () => useQuery({
    queryKey: ['multipleFiles'],
    queryFn: async () => await mainAxios.get<GetMultipleFilesResponse>('files/uploads'),
});



