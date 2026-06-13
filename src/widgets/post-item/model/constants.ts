import type { ActionButton } from "./types";

export enum ACTION_BUTTONS_KEYS {
    HIDE = 'HIDE',
    EDIT = 'EDIT',
    DELETE = 'DELETE',
    ADD_TO_ARCHIVE = 'ADD_TO_ARCHIVE',
    ADD_TO_COLLECTION = 'ADD_TO_COLLECTION',
    REMOVE_FROM_ARCHIVE = 'REMOVE_FROM_ARCHIVE',
    REMOVE_FROM_COLLECTION = 'REMOVE_FROM_COLLECTION',
}

export enum ACTION_BUTTONS_ALLOWED {
    FAVORITE = 'FAVORITE',
    MAIN = 'MAIN',
}

export const ACTION_BUTTONS: ActionButton[] = [
    {
        label: 'Скрыть',
        key: ACTION_BUTTONS_KEYS.HIDE,
    },
    {
        label: 'Добавить в подборку',
        key: ACTION_BUTTONS_KEYS.ADD_TO_COLLECTION,
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
        label: 'Добавить в архив',
        key: ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
    },
    {
        label: 'Удалить из архива',
        key: ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
    },
] as const;