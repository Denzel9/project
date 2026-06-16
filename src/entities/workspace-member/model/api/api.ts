import { useMutation, useQuery, } from '@tanstack/react-query';

import { mainAxios, queryClient } from '@/shared/api';

import type { InviteUserRequest, WorkspaceMember } from '../types/types';

const POSTS_KEY = ['posts'] as const;
const APPLICATIONS_KEY = ['applications'] as const;
const WORKSPACE_MEMBERS_KEY = ['workspace-members'] as const;

const invalidateProfileScopedQueries = () => {
  void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
  void queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY });
  void queryClient.invalidateQueries({ queryKey: ['tasks'] });
  void queryClient.invalidateQueries({ queryKey: WORKSPACE_MEMBERS_KEY });
};

export const useGetProfilesQuery = () =>
  useQuery({
    queryKey: ['profiles'],
    queryFn: async () =>
      await mainAxios.get<WorkspaceMember[]>('auth/profiles'),
  });

export const useSwitchProfileMutation = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await mainAxios.post<{ user: WorkspaceMember }>('auth/switch-profile', { userId: id }),
    onSuccess: invalidateProfileScopedQueries,
  });

export const useAddInviteMutation = () =>
  useMutation({
    mutationFn: async (body: InviteUserRequest) =>
      await mainAxios.post<WorkspaceMember>('auth/invites', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_MEMBERS_KEY });
    },
  });

export const useAcceptInviteMutation = () =>
  useMutation({
    mutationFn: async (token: string) =>
      await mainAxios.post<WorkspaceMember>('auth/invites/accept', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_MEMBERS_KEY });
    },
  });

export const useDeleteMembershipMutation = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await mainAxios.delete<WorkspaceMember>(`auth/memberships/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_MEMBERS_KEY });
    },
  });


