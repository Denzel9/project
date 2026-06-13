import type { ApplicationStatus } from "@/entities/application";
import type { Post } from "@/entities/post";

import type { ACTION_BUTTONS_ALLOWED, ACTION_BUTTONS_KEYS } from "./constants";

export type PostItemProps = {
    isCompact?: boolean;
    post: Post;
    permissions?: ACTION_BUTTONS_KEYS[];
    isMyPost?: boolean;
    isFavorite?: boolean;
    isApplied?: boolean;
    applicationId?: string;
    applicationStatus?: ApplicationStatus;
};

export type ActionButton = {
    key: ACTION_BUTTONS_KEYS;
    label: string;
    allowed?: ACTION_BUTTONS_ALLOWED[];
};

