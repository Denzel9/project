import * as yup from 'yup'

import { PlacementFormatEnum, PlatformEnum } from '@/entities/post'

import { composeTaskDescription } from '../taskTzFields'

const sectionField = () => yup.string().default('')

const listItemSchema = yup.object({
  value: sectionField(),
})

const deliverableSchema = yup.object({
  platform: yup.string().default(PlatformEnum.INSTAGRAM),
  format: yup.string().default(PlacementFormatEnum.REELS),
  count: yup.string().default('1'),
  durationSec: yup.string().default(''),
})

export const schema = yup.object().shape({
  title: sectionField(),
  description: sectionField().max(
    10000,
    'Описание не должно превышать 10000 символов',
  ),
  dosAndDonts: sectionField(),
  cta: sectionField(),
  brandGuidelinesUrl: sectionField(),
  deliverables: yup.array().of(deliverableSchema).default([]),
  hashtagItems: yup.array().of(listItemSchema).default([]),
  mentionItems: yup.array().of(listItemSchema).default([]),
  referenceItems: yup.array().of(listItemSchema).default([]),
  locationCountry: sectionField(),
  locationCity: sectionField(),
  locationAddress: sectionField(),
  locationShootingRequired: yup.boolean().default(false),
  cooperationExclusivity: yup.boolean().default(false),
  cooperationExclusivityDays: sectionField(),
  cooperationUsageRights: sectionField(),
  cooperationUsageDurationDays: sectionField(),
  cooperationRequiresMarking: yup.boolean().default(false),
  cooperationRequiresContract: yup.boolean().default(false),
  cooperationNdaRequired: yup.boolean().default(false),
  bloggerMinFollowers: sectionField(),
  bloggerMaxFollowers: sectionField(),
  bloggerMinEngagementRate: sectionField(),
  bloggerVerifiedAccount: yup.boolean().default(false),
  bloggerExperienceWithAds: yup.boolean().default(false),
  bloggerLanguages: yup.array().of(listItemSchema).default([]),
  bloggerContentStyles: yup.array().of(listItemSchema).default([]),
  photoCount: sectionField(),
  videoCount: sectionField(),
  finalDate: yup.string().nullable().default(null),
}).test(
  'tz-length',
  'Общий объём ТЗ не должен превышать 15000 символов',
  values => composeTaskDescription(values).length <= 15000,
)

export const defaultValues = schema.getDefault()
export type TaskFormType = yup.InferType<typeof schema>
export const schemaKeys = Object.keys(defaultValues) as Array<keyof TaskFormType>
