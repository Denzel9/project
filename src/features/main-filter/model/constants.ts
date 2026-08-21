export enum FILTERS_VALUES {
    TODAY = 'today',
    REMOTE = 'remote',
    WITH_MEDIA = 'with_media',
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
        label: 'Только с медиа',
        value: FILTERS_VALUES.WITH_MEDIA,
    },
] as const;
