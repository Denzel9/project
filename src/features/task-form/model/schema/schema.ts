import * as yup from 'yup'

export const schema = yup.object().shape({
  title: yup.string().default(''),
  description: yup
    .string()
    .default('')
    .required('Описание обязательно для заполнения')
    .max(5000, 'Описание не должно превышать 5000 символов'),
  photoCount: yup.string().default(''),
  videoCount: yup.string().default(''),
  finalDate: yup.string().nullable().default(null),
})

export const defaultValues = schema.getDefault()
export type TaskFormType = yup.InferType<typeof schema>
export const schemaKeys = Object.keys(defaultValues) as Array<keyof TaskFormType>
