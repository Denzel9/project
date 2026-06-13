import * as yup from 'yup'

import { PostContentTypeEnum } from '@/entities/post'

export const schema = yup.object().shape({
  title: yup.string().default('').required('Обязательно для заполнения'),
  chips: yup.array().of(yup.string()).default([]),
  typeCooperation: yup
    .array()
    .of(yup.string())
    .min(1, 'Обязательно для заполнения')
    .default([]),
  urgent: yup.boolean().required('Обязательно для заполнения'),
  description: yup.string().default('').required('Обязательно для заполнения'),
  contentType: yup.string().default(PostContentTypeEnum.PHOTO).required('Обязательно для заполнения'),
  photoCount: yup.string().default(''),
  videoCount: yup.string().default(''),
  finalPrice: yup.string().default(''),
  rangePrice: yup.array().of(yup.string()).default([]),

  keyWords: yup.array().of(yup.string()).default([]),
  categories: yup.array().of(yup.string()).default([]),
})

export const defaultValues = schema.getDefault()
export type FormProductType = yup.InferType<typeof schema>
export const schemaKeys = Object.keys(defaultValues) as Array<keyof FormProductType>
