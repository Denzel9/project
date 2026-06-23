import { USER_ROLE } from "@/entities";

import { AUTH_TYPES } from "../routes/routes";

import type { MenuRoute } from "../types/types";

export const getIsVisibleRoute = (route: MenuRoute, isAuth: boolean, role: USER_ROLE) => {
    if (route.authTypes.includes(AUTH_TYPES.ONLY_AUTH) && !isAuth) return false;

    if (
        route.authTypes.includes(AUTH_TYPES.CREATOR) &&
        role !== USER_ROLE.CREATOR
    )
        return false;

    if (
        route.authTypes.includes(AUTH_TYPES.COMPANY) &&
        role !== USER_ROLE.COMPANY
    )
        return false;

    return true;
};