export type ProfileRole = 'CREATOR' | 'COMPANY' | 'MANAGER';

export type InviteKind = 'TEAM' | 'CROSS';

export type ProfileListScope = 'all' | 'companies' | 'linked';

export type WorkspaceMember = {
  id: string;
  email?: string;
  avatar?: string;
  displayName?: string;
  /** ФИО менеджера аккаунта — для COMPANY/CREATOR в switch */
  actorName?: string | null;
  isActive?: boolean;
  isVerified?: boolean;
  isEmailConfirmed?: boolean;
  membershipId?: string;
  membershipRole?: MemberRole;
  role?: ProfileRole;
  userId?: string;
  createdAt?: string;
  linkKind?: 'own' | 'companies' | 'linked';
  canSwitch?: boolean;
};

export type ProfileMember = {
  accountId: string;
  membershipId: string;
  membershipRole: MemberRole;
  email: string;
  displayName: string;
  /** OWNER — владелец профиля; MANAGER — приглашённый менеджер */
  kind?: 'OWNER' | 'MANAGER';
};

export type InviteUserRequest = {
  email: string;
  userId: string;
  role: MemberRole;
  kind: InviteKind;
};

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export const MemberRoleLabels = {
  [MemberRole.OWNER]: 'Владелец',
  [MemberRole.ADMIN]: 'Менеджер',
} as const;

export const ProfileMemberKindLabels = {
  OWNER: 'Владелец',
  MANAGER: 'Менеджер',
} as const;

export const ProfileRoleLabels: Record<ProfileRole, string> = {
  CREATOR: 'Исполнитель',
  COMPANY: 'Компания',
  MANAGER: 'Менеджер',
};

export const isManagedProfile = (member: WorkspaceMember) =>
  member.role === 'CREATOR' || member.role === 'COMPANY';

/** Подписи для profile switch: название компании/исполнителя + ФИО менеджера */
export const getProfileSwitchLines = (item: WorkspaceMember) => {
  if (item.role === 'COMPANY' || item.role === 'CREATOR') {
    return {
      primary: item.displayName || ProfileRoleLabels[item.role],
      secondary: item.actorName || '',
    };
  }

  if (item.role === 'MANAGER') {
    return {
      primary: item.displayName || item.email || 'Менеджер',
      secondary: '',
    };
  }

  return {
    primary: item.displayName || 'Профиль',
    secondary: item.role ? ProfileRoleLabels[item.role] : '',
  };
};
