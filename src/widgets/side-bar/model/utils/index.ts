import { USER_ROLE } from "@/entities";
import { ROUTES } from "@/shared/config/routes";

import { AUTH_TYPES } from "../routes/routes";

import type { MenuRoute } from "../types/types";


export const getIsVisibleRoute = (route: MenuRoute, isAuth: boolean, role: USER_ROLE) => {
    if (role === USER_ROLE.MANAGER) {
        if (
            route.path === ROUTES.PROFILE ||
            route.path === ROUTES.INDEX ||
            route.path === ROUTES.FAVORITES ||
            route.path === ROUTES.CRM ||
            route.path === ROUTES.MY_TASKS
        ) {
            return false;
        }
    }

    const authTypes = route.authTypes;

    if (!authTypes) return true;

    if (authTypes.includes(AUTH_TYPES.ONLY_AUTH) && !isAuth) return false;

    if (authTypes.includes(AUTH_TYPES.MARKETPLACE)) {
        const isParticipant =
            role === USER_ROLE.CREATOR ||
            role === USER_ROLE.COMPANY ||
            role === USER_ROLE.MANAGER;

        if (!isParticipant) return false;
    }

    if (
        authTypes.includes(AUTH_TYPES.CREATOR) &&
        role !== USER_ROLE.CREATOR
    )
        return false;

    if (
        authTypes.includes(AUTH_TYPES.COMPANY) &&
        role !== USER_ROLE.COMPANY
    )
        return false;

    if (
        authTypes.includes(AUTH_TYPES.MANAGER) &&
        role !== USER_ROLE.MANAGER
    )
        return false;

    return true;
};
