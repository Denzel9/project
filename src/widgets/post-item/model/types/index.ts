import type { ACTION_BUTTONS_KEYS } from "../constants";

export type UseActionsProps = {
    id: string;
    permissions: ACTION_BUTTONS_KEYS[]

    // media: Media[]
    // title: string;
    // ownerId: string
    // chips: string[]
    // description: string;

    // typeCooperation: string[]
    // urgent: boolean
    // contentType: string
    // photoCount: string
    // videoCount: string

    // finalPrice: boolean
    // rangePrice: string[]
    // createdAt: string
    // updatedAt: string

    // isArchived: boolean

    // keyWords: string[]
    // categories: string[]
};

export type Media = {
    url: string;
    key: string;
    size: string;
    mimeType: string;
}