import type { ActionButton } from "./types";

export enum ACTION_BUTTONS_KEYS {
    EDIT = 'EDIT',
    DELETE = 'DELETE',
    ADD_TO_ARCHIVE = 'ADD_TO_ARCHIVE',
    ADD_TO_COLLECTION = 'ADD_TO_COLLECTION',
    ADD_TO_FAVORITE_GROUP = 'ADD_TO_FAVORITE_GROUP',
    REMOVE_FROM_ARCHIVE = 'REMOVE_FROM_ARCHIVE',
    REMOVE_FROM_COLLECTION = 'REMOVE_FROM_COLLECTION',
    MAKE_PRIVATE = 'MAKE_PRIVATE',
    MAKE_PUBLIC = 'MAKE_PUBLIC',
}

export enum ACTION_BUTTONS_ALLOWED {
    FAVORITE = 'FAVORITE',
    MAIN = 'MAIN',
}

export const ACTION_BUTTONS: ActionButton[] = [
    {
        label: 'Добавить в подборку',
        key: ACTION_BUTTONS_KEYS.ADD_TO_COLLECTION,
    },
    {
        label: 'Добавить в подборку',
        key: ACTION_BUTTONS_KEYS.ADD_TO_FAVORITE_GROUP,
    },
    {
        label: 'Удалить из подборки',
        key: ACTION_BUTTONS_KEYS.REMOVE_FROM_COLLECTION,
    },
    {
        label: 'Редактировать',
        key: ACTION_BUTTONS_KEYS.EDIT,
    },
    {
        label: 'Удалить',
        key: ACTION_BUTTONS_KEYS.DELETE,
    },
    {
        label: 'Переместить в архив',
        key: ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
    },
    {
        label: 'Вернуть из архива',
        key: ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
    },
    {
        label: 'Сделать приватным',
        key: ACTION_BUTTONS_KEYS.MAKE_PRIVATE,
    },
    {
        label: 'Сделать публичным',
        key: ACTION_BUTTONS_KEYS.MAKE_PUBLIC,
    },
] as const;