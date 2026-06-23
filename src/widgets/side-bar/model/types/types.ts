import type { AUTH_TYPES } from "../routes/routes";

export type MenuRoute = {
    path: string;
    label: string;
    icon: React.ReactNode;
    authTypes: typeof AUTH_TYPES[keyof typeof AUTH_TYPES][];
};
