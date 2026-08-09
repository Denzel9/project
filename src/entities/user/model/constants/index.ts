import type { Person } from "../types";

export enum MY_PARAMETERS {
    HEIGHT = 'height',
    WEIGHT = 'weight',
    SIZE = 'size',
    BIRTHDAY = 'birthday',
    GENDER = 'gender',
    PARAMETERS = 'parameters',
}

export const MY_PARAMETERS_LABELS: Partial<Record<keyof Person, string>> = {
    [MY_PARAMETERS.HEIGHT]: 'Рост',
    [MY_PARAMETERS.WEIGHT]: 'Вес',
    [MY_PARAMETERS.SIZE]: 'Размер',
    [MY_PARAMETERS.BIRTHDAY]: 'Дата рождения',
    [MY_PARAMETERS.GENDER]: 'Пол',
    [MY_PARAMETERS.PARAMETERS]: 'Параметры',
}

export const GENDER_LABELS: Record<string, string> = {
    male: 'Мужской',
    female: 'Женский',
}

export enum USER_ROLE {
    CREATOR = 'CREATOR',
    COMPANY = 'COMPANY',
    MANAGER = 'MANAGER',
}