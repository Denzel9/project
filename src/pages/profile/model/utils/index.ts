import { ACTION_BUTTONS_KEYS } from "@/widgets";

export const getPostPermissions = ({ isActive, isPrivate }: { isActive: boolean, isPrivate: boolean }) => {
    const permissions = []

    if (isActive) {
        permissions.push(ACTION_BUTTONS_KEYS.EDIT, ACTION_BUTTONS_KEYS.DELETE, ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE, ACTION_BUTTONS_KEYS.MAKE_PRIVATE);
    } else if (!isActive && !isPrivate) {
        permissions.push(ACTION_BUTTONS_KEYS.EDIT, ACTION_BUTTONS_KEYS.DELETE, ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE, ACTION_BUTTONS_KEYS.MAKE_PUBLIC);
    } else if (isPrivate) {
        permissions.push(ACTION_BUTTONS_KEYS.EDIT, ACTION_BUTTONS_KEYS.DELETE, ACTION_BUTTONS_KEYS.MAKE_PUBLIC);
    }

    return permissions;
};