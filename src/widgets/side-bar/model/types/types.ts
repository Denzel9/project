import type { AUTH_TYPES } from "../routes/routes";

export type SidebarBadgeKey = 'chat' | 'applications' | 'tasks';

export type MenuRoute = {
    path: string;
    label: string;
    icon: React.ReactNode;
    authTypes?: typeof AUTH_TYPES[keyof typeof AUTH_TYPES][];
    badgeKey?: SidebarBadgeKey;
};
