export type ProfileRole = 'CREATOR' | 'COMPANY' | 'MANAGER';

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
};

export type ProfileMember = {
  accountId: string;
  membershipId: string;
  membershipRole: MemberRole;
  email: string;
  displayName: string;
};

export type InviteUserRequest = {
  email: string;
  userId: string;
  role: MemberRole;
};

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export const MemberRoleLabels = {
  [MemberRole.OWNER]: 'Владелец',
  [MemberRole.ADMIN]: 'Администратор',
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
