export type WorkspaceMember = {
  id: string;
  email?: string;
  avatar?: string
  displayName?: string;
  isActive?: boolean;
  membershipId?: string;
  membershipRole?: MemberRole;
  role?: MemberRole;
  userId?: string;
};

export type InviteUserRequest = {
  email: string;
  userId: string;
  role: MemberRole;
};

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export const MemberRoleLabels = {
  [MemberRole.OWNER]: 'Владелец',
  [MemberRole.ADMIN]: 'Администратор',
  [MemberRole.EDITOR]: 'Редактор',
  [MemberRole.VIEWER]: 'Наблюдатель',
} as const;