import * as yup from 'yup';

import {
  ContactType,
  validateContactValue,
  validateParameters,
  validatePhone,
} from '@/entities/user';

export const accountSchema = yup.object().shape({
  contacts: yup.array().of(yup.object().shape({
    value: yup
      .string()
      .required('Обязательно для заполнения')
      .test('value', 'Неверное значение', (value, { parent: { type } }) =>
        validateContactValue(value, type)
      ),
    label: yup.string().optional().nullable(),
    type: yup
      .mixed<ContactType>()
      .oneOf(Object.values(ContactType), 'Неверный тип контакта')
      .required('Обязательно для заполнения'),
  })).default([]).optional().nullable(),

  companyName: yup.string().default('').optional().nullable(),
  name: yup.string().default('').optional().nullable(),
  lastName: yup.string().default('').optional().nullable(),
  bio: yup.string().default('').optional().nullable(),
  aboutMe: yup.string().default('').optional().nullable(),
  location: yup.string().default('').optional().nullable(),
  email: yup.string().email().default('').optional(),
  phone: yup.string().test('phone', 'Неверный номер телефона', validatePhone).default('').optional().nullable(),

  height: yup.string().default('').optional().nullable(),
  weight: yup.string().default('').optional().nullable(),
  size: yup.string().default('').optional().nullable(),
  birthday: yup.string().default('').optional().nullable(),
  gender: yup.string().default('').optional().nullable(),
  parameters: yup
    .string()
    .test(
      'parameters',
      'Формат: 90/60/90 (2–3 цифры в каждой группе)',
      validateParameters
    )
    .default('')
    .optional()
    .nullable(),

  avatar: yup.string().url().default('').optional().nullable(),
  banner: yup.string().url().default('').optional().nullable(),
});

export const defaultAccountSchemaValues = accountSchema.getDefault();

export type AccountSchemaFormType = yup.InferType<typeof accountSchema>;
