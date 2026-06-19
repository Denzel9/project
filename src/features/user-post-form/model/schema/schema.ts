import * as yup from 'yup'

export const schema = yup.object().shape({
  title: yup.string().default('').required('Обязательно для заполнения'),
  chips: yup.array().of(yup.string()).default([]),
  description: yup.string().default('').required('Обязательно для заполнения'),

  keyWords: yup.array().of(yup.string()).default([]),
  categories: yup.array().of(yup.string()).default([]),
})

export const defaultValues = schema.getDefault()
export type FormProductType = yup.InferType<typeof schema>
export const schemaKeys = Object.keys(defaultValues) as Array<keyof FormProductType>
