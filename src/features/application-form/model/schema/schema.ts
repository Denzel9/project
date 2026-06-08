import * as yup from 'yup'

export const schema = yup.object().shape({
  name: yup.string().default('').required('Обязательно для заполнения'),
  advantage: yup.array().of(yup.string()).default([]),
  cooperationType: yup.string().default('').required('Обязательно для заполнения'),
  urgent: yup.string().default('').required('Обязательно для заполнения'),
  description: yup.string().default('').required('Обязательно для заполнения'),
  contentType: yup.string().default('').required('Обязательно для заполнения'),
  photoCount: yup.string().default(''),
  videoCount: yup.string().default(''),
  finalPrice: yup.boolean().default(true),
  price: yup.string().default('').required('Обязательно для заполнения'),
})

export const defaultValues = schema.getDefault()
export type FormProductType = yup.InferType<typeof schema>
export const schemaKeys = Object.keys(defaultValues) as Array<keyof FormProductType>
