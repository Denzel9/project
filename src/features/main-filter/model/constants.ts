export enum FILTERS_VALUES {
    TODAY = 'today',
    REMOTE = 'remote',
    WITH_PHOTO = 'with_photo',
}

export const FILTERS = [
    {
        label: 'За сегодня',
        value: FILTERS_VALUES.TODAY,
    },
    {
        label: 'Удаленно',
        value: FILTERS_VALUES.REMOTE,
    },
    {
        label: 'Только с фото',
        value: FILTERS_VALUES.WITH_PHOTO,
    },
] as const;