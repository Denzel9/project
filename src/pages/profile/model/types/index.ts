export type MediaContentProps = {
    userId?: string;
    mediaTabValue: MediaTabValue;
};

export enum MEDIA_TAB_VALUES {
    ACTIVE = 'Active',
    ARCHIVED = 'Archived',
}

export type MediaTabValue = MEDIA_TAB_VALUES.ACTIVE | MEDIA_TAB_VALUES.ARCHIVED;

