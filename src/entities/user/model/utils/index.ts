import type { User } from "../types";

export const getUserName = (user: User) => {
    if (user?.companyProfile) {
        return user?.companyProfile?.companyName;
    }

    return `${user?.creatorProfile?.name} ${user?.creatorProfile?.lastName}`;
};