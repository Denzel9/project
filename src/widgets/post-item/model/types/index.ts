import type { ACTION_BUTTONS_KEYS } from "../constants";

export type UseActionsProps = {
    id: string;
    permissions: ACTION_BUTTONS_KEYS[];
};

export type Media = {
    url: string;
    key: string;
    size: string;
    mimeType: string;
}