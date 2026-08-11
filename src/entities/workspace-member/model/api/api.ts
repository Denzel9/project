import { useMutation, useQuery } from '@tanstack/react-query'

import { mainAxios, queryClient } from '@/shared/api'

import type {
  InviteUserRequest,
  ProfileListScope,
  ProfileMember,
  WorkspaceMember,
} from '../types/types'

import type { AuthSessionUser } from '@/features/auth/model/types/types'

const WORKSPACE_MEMBERS_KEY = ['workspace-members'] as const
const PROFILE_MEMBERS_KEY = ['profile-members'] as const
const PROFILES_KEY = ['profiles'] as const

const invalidateMembershipQueries = () => {
  void queryClient.invalidateQueries({ queryKey: WORKSPACE_MEMBERS_KEY })
  void queryClient.invalidateQueries({ queryKey: PROFILE_MEMBERS_KEY })
  void queryClient.invalidateQueries({ queryKey: PROFILES_KEY })
}

export const useGetProfilesQuery = (scope: ProfileListScope = 'all') =>
  useQuery({
    queryKey: [...PROFILES_KEY, scope],
    queryFn: async () => {
      const params = scope === 'all' ? undefined : { scope }
      return await mainAxios.get<WorkspaceMember[]>('auth/profiles', { params })
    },
  })

export const useGetProfileMembersQuery = (enabled = true) =>
  useQuery({
    queryKey: PROFILE_MEMBERS_KEY,
    enabled,
    queryFn: async () => {
      const { data } = await mainAxios.get<ProfileMember[]>(
        'auth/profile-members',
      )
      return data
    },
  })

/** Только API. Полный сброс сессии — через useSwitchActiveProfile / applySwitchedProfileSession. */
export const useSwitchProfileMutation = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await mainAxios.post<{ user: AuthSessionUser }>('auth/switch-profile', {
        userId: id,
      }),
  })

export const useAddInviteMutation = () =>
  useMutation({
    mutationFn: async (body: InviteUserRequest) =>
      await mainAxios.post<WorkspaceMember>('auth/invites', body),
    onSuccess: invalidateMembershipQueries,
  })

export const useAcceptInviteMutation = () =>
  useMutation({
    mutationFn: async (token: string) =>
      await mainAxios.post<WorkspaceMember>('auth/invites/accept', { token }),
    onSuccess: invalidateMembershipQueries,
  })

export const useDeleteMembershipMutation = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await mainAxios.delete<WorkspaceMember>(`auth/memberships/${id}`),
    onSuccess: invalidateMembershipQueries,
  })
