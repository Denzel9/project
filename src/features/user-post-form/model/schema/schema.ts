import * as yup from 'yup'

import { BudgetTypeEnum, EmploymentTypeEnum, WorkFormatEnum } from '@/entities/post'

export const schema = yup.object().shape({
  title: yup.string().default('').required('Обязательно для заполнения'),
  description: yup
    .string()
    .default('')
    .max(1000, 'Максимум 1000 символов')
    .required('Обязательно для заполнения'),
  chips: yup.array().of(yup.string()).default([]),
  isPrivate: yup.boolean().default(false),
  workFormat: yup
    .string()
    .default(WorkFormatEnum.REMOTE)
    .required('Обязательно для заполнения'),
  employmentType: yup
    .string()
    .oneOf(['', ...Object.values(EmploymentTypeEnum)])
    .default(''),

  keyWords: yup.array().of(yup.string()).default([]),
  categories: yup.array().of(yup.string()).default([]),
  tags: yup.array().of(yup.string()).default([]),
  niche: yup.array().of(yup.string()).default([]),
  platforms: yup.array().of(yup.string()).default([]),
  portfolioLinks: yup.array().of(yup.string()).default([]),

  budgetType: yup
    .string()
    .default(BudgetTypeEnum.NEGOTIABLE)
    .required('Обязательно для заполнения'),
  budgetAmount: yup.string().default(''),
  budgetMinAmount: yup.string().default(''),
  budgetMaxAmount: yup.string().default(''),
  barterDescription: yup.string().default(''),
  budgetCurrency: yup.string().default('RUB'),
  paymentTerms: yup.string().default(''),

  locationCity: yup.string().default(''),
  locationCountry: yup.string().default(''),
  locationAddress: yup.string().default(''),
})

export const defaultValues = schema.getDefault()
export type FormProductType = yup.InferType<typeof schema>
export const schemaKeys = Object.keys(defaultValues) as Array<
  keyof FormProductType
>
