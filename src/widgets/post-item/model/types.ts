import type { ACTION_BUTTONS_ALLOWED, ACTION_BUTTONS_KEYS } from "./constants";
import type { ApplicationStatus } from "@/entities/application";
import type { Post } from "@/entities/post";

export type PostItemProps = {
    removePostFromCollection?: (postId: string) => void;
    post: Post;
    isMyPost?: boolean;
    isCompact?: boolean;
    isCompany?: boolean;
    isApplied?: boolean;
    isPrivate?: boolean;
    isFavorite?: boolean;
    applicationId?: string;
    permissions?: ACTION_BUTTONS_KEYS[];
    applicationStatus?: ApplicationStatus;
};

export type ActionButton = {
    label: string;
    key: ACTION_BUTTONS_KEYS;
    allowed?: ACTION_BUTTONS_ALLOWED[];
};

