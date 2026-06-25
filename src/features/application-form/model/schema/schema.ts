import * as yup from 'yup'

import {
  BudgetTypeEnum,
  PlacementFormatEnum,
  PlatformEnum,
  WorkFormatEnum,
} from '@/entities/post'

const deliverableSchema = yup.object({
  platform: yup
    .string()
    .default(PlatformEnum.INSTAGRAM)
    .required('Обязательно'),
  format: yup
    .string()
    .default(PlacementFormatEnum.REELS)
    .required('Обязательно'),
  count: yup.string().default('1'),
  durationSec: yup.string().default(''),
})

export const schema = yup.object().shape({
  title: yup.string().default('').required('Обязательно для заполнения'),
  description: yup.string().default('').required('Обязательно для заполнения'),
  urgent: yup.boolean().required('Обязательно для заполнения'),
  isPrivate: yup.boolean().default(false),
  workFormat: yup
    .string()
    .default(WorkFormatEnum.REMOTE)
    .required('Обязательно для заполнения'),
  deadline: yup.string().default(''),

  chips: yup.array().of(yup.string()).default([]),
  keyWords: yup.array().of(yup.string()).default([]),
  categories: yup.array().of(yup.string()).default([]),
  tags: yup.array().of(yup.string()).default([]),
  niche: yup.array().of(yup.string()).default([]),

  budgetType: yup
    .string()
    .default(BudgetTypeEnum.FIXED)
    .required('Обязательно для заполнения'),
  budgetAmount: yup.string().default(''),
  budgetMinAmount: yup.string().default(''),
  budgetMaxAmount: yup.string().default(''),
  barterDescription: yup.string().default(''),
  budgetCurrency: yup.string().default('RUB'),
  paymentTerms: yup.string().default(''),

  deliverables: yup
    .array()
    .of(deliverableSchema)
    .min(1, 'Добавьте хотя бы одну позицию контента')
    .default([]),

  locationCity: yup.string().default(''),
  locationCountry: yup.string().default(''),
  locationAddress: yup.string().default(''),
  shootingRequired: yup.boolean().default(false),

  bloggerMinFollowers: yup.string().default(''),
  bloggerMaxFollowers: yup.string().default(''),
  bloggerMinEngagementRate: yup.string().default(''),
  bloggerVerifiedAccount: yup.boolean().default(false),
  bloggerExperienceWithAds: yup.boolean().default(false),
  bloggerLanguages: yup.array().of(yup.string()).default([]),
  bloggerContentStyle: yup.array().of(yup.string()).default([]),

  coopExclusivity: yup.boolean().default(false),
  coopExclusivityDays: yup.string().default(''),
  coopUsageRights: yup.string().default(''),
  coopUsageDurationDays: yup.string().default(''),
  coopRequiresMarking: yup.boolean().default(false),
  coopRequiresContract: yup.boolean().default(false),
  coopNdaRequired: yup.boolean().default(false),

  briefTaskDescription: yup.string().default(''),
  briefReferences: yup.array().of(yup.string()).default([]),
  briefBrandGuidelinesUrl: yup.string().default(''),
  briefHashtags: yup.array().of(yup.string()).default([]),
  briefMentions: yup.array().of(yup.string()).default([]),
  briefCta: yup.string().default(''),
  briefDosAndDonts: yup.string().default(''),
})

export const defaultValues = schema.getDefault()
export type FormProductType = yup.InferType<typeof schema>
export const schemaKeys = Object.keys(defaultValues) as Array<
  keyof FormProductType
>
