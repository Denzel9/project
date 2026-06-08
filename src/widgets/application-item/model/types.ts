import type { ACTION_BUTTONS_ALLOWED, ACTION_BUTTONS_KEYS } from "./constants";

export type ApplicationItemProps = {
    item: number;
    permissions?: ACTION_BUTTONS_KEYS[];
    isFavorite?: boolean;
    isMyApplication?: boolean;
};

export type ActionButton = {
    key: ACTION_BUTTONS_KEYS;
    label: string;
    allowed?: ACTION_BUTTONS_ALLOWED[];
};

