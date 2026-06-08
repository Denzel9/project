import type { AUTH_TYPES } from "./routes";

export type MenuRoute = {
    authType: typeof AUTH_TYPES[keyof typeof AUTH_TYPES];
    path: string;
    icon: React.ReactNode;
    label: string;
};
