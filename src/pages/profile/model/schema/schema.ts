import * as yup from 'yup';

import { ContactType } from '@/entities/user';

const validatePhone = (value: string) => {
    if (!value) return true;

    const newValue = value?.startsWith('+7') ? value : '+7 ' + value;
    return newValue.length === 16;
}

export const profileSchema = yup.object().shape({
    bio: yup.string().max(200, 'Максимальное количество символов: 200').default('').optional().nullable(),
    email: yup.string().email().default('').optional(),
    phone: yup.string().test('phone', 'Неверный номер телефона', validatePhone).default('').optional().nullable(),
    location: yup.string().max(200, 'Максимальное количество символов: 200').default('').optional().nullable(),
    aboutMe: yup.string().max(1000, 'Максимальное количество символов: 1000').default('').optional().nullable(),
    avatar: yup.string().url().default('').optional().nullable(),
    banner: yup.string().url().default('').optional().nullable(),
    contacts: yup.array().of(yup.object().shape({
        value: yup.string().test('value', 'Неверное значение', (value, { parent: { type } }) => {
            return type === ContactType.PHONE ? validatePhone(value) : true;
        }).default('').optional().nullable(),
        label: yup.string().default('').optional().nullable(),
        type: yup.string().default('').optional().nullable(),
    })).default([]).optional().nullable(),
});

export const defaultValues = profileSchema.getDefault();

export type ProfileSchemaType = yup.InferType<typeof profileSchema>;

export const PROFILE_SCHEMA_KEYS = Object.keys(defaultValues) as (keyof ProfileSchemaType)[];