export enum FILTERS_VALUES {
    TODAY = 'today',
    REMOTE = 'remote',
    LONG_TERM = 'long_term',
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
        label: 'Долгосрочно',
        value: FILTERS_VALUES.LONG_TERM,
    },
] as const;