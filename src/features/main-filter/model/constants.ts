export enum FILTERS_VALUES {
    TODAY = 'today',
    REMOTE = 'remote',
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
] as const;