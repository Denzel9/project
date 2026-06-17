import * as yup from 'yup'

export const schema = yup.object().shape({
  description: yup.string().default(''),
  photoCount: yup.string().default(''),
  videoCount: yup.string().default(''),
  finalDate: yup.string().nullable().default(null),
})

export const defaultValues = schema.getDefault()
export type TaskFormType = yup.InferType<typeof schema>
export const schemaKeys = Object.keys(defaultValues) as Array<keyof TaskFormType>
