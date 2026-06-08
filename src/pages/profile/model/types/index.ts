export type MediaContentProps = {
    mediaTabValue: MediaTabValue;
    setMediaTabValue: (value: MediaTabValue) => void;
};

export enum MEDIA_TAB_VALUES {
    ACTIVE = 'Active',
    ARCHIVED = 'Archived',
}

export type MediaTabValue = MEDIA_TAB_VALUES.ACTIVE | MEDIA_TAB_VALUES.ARCHIVED;

