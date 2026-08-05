import { useMutation, useQueryClient } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'

import type { AuthResponse, LoginRequest, RecoveryPasswordRequest, RegistrationCompanyRequest, RegistrationCreatorRequest, RegistrationManagerRequest, ResetPasswordRequest } from '../types/types'

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (body: LoginRequest) => await mainAxios.post<AuthResponse>('auth/login', body)
  })

export const useRegistrationCompanyMutation = () =>
  useMutation({
    mutationFn: async (body: RegistrationCompanyRequest) => await mainAxios.post<AuthResponse>('auth/register/company', body),
  })

export const useRegistrationUserMutation = () =>
  useMutation({
    mutationFn: async (body: RegistrationCreatorRequest) => await mainAxios.post<AuthResponse>('auth/register/creator', body),
  })

export const useRegistrationManagerMutation = () =>
  useMutation({
    mutationFn: async (body: RegistrationManagerRequest) =>
      await mainAxios.post<AuthResponse>('auth/register/manager', body),
  })

export const useRefreshTokenMutation = () =>
  useMutation({
    mutationFn: async () => await mainAxios.post<AuthResponse>('/auth/refresh'),
  })

export const useRecoveryPasswordMutation = () =>
  useMutation({
    mutationFn: async (body: RecoveryPasswordRequest) => await mainAxios.post<AuthResponse>('/auth/recovery-password', body),
  })

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: async (body: ResetPasswordRequest) => await mainAxios.post<AuthResponse>('/auth/reset-password', body),
  })

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => await mainAxios.post<AuthResponse>('auth/logout'),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['auth'] })
    },
  })
}

export const useVerifyPasswordMutation = () =>
  useMutation({
    mutationFn: async (body: { password: string }) => await mainAxios.post<boolean>('auth/verify-password', body),
  })

export const useSendConfirmEmailMutation = () =>
  useMutation({
    mutationFn: async () =>
      await mainAxios.post<{ message: string }>('auth/confirm-email/send'),
  })

export const useConfirmEmailMutation = () =>
  useMutation({
    mutationFn: async (body: { token: string }) =>
      await mainAxios.post<{ message: string }>('auth/confirm-email', body),
  })
