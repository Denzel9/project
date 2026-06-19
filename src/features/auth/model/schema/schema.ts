import * as yup from 'yup'

export const loginSchema = yup.object().shape({
  email: yup.string().default('').required('Поле обязательно для заполнения'),
  password: yup.string().default('').required('Поле обязательно для заполнения'),
  rememberMe: yup.boolean().default(false).optional(),
})

export type LoginFormType = yup.InferType<typeof loginSchema>

export const defaultLoginValues = loginSchema.getDefault()

export const registrationCompanySchema = yup.object().shape({
  companyName: yup.string().default('').required('Поле обязательно для заполнения'),
  email: yup.string().default('').required('Поле обязательно для заполнения'),
  password: yup.string().default('').required('Поле обязательно для заполнения'),
})

export type RegistrationCompanyFormType = yup.InferType<typeof registrationCompanySchema>

export const defaultRegistrationCompanyValues = registrationCompanySchema.getDefault()

export const registrationCreatorSchema = yup.object().shape({
  name: yup.string().default('').required('Поле обязательно для заполнения'),
  lastName: yup.string().default('').required('Поле обязательно для заполнения'),
  email: yup.string().default('').required('Поле обязательно для заполнения'),
  password: yup.string().default('').required('Поле обязательно для заполнения'),
})

export type RegistrationCreatorFormType = yup.InferType<typeof registrationCreatorSchema>

export const defaultRegistrationCreatorValues = registrationCreatorSchema.getDefault()

export const resetPasswordSchema = yup.object().shape({
  oldPassword: yup.string().default('').required('Поле обязательно для заполнения').min(8, 'Пароль должен быть не менее 8 символов'),
  newPassword: yup.string().default('').required('Поле обязательно для заполнения').min(8, 'Пароль должен быть не менее 8 символов'),
  repeatNewPassword: yup.string().default('').required('Поле обязательно для заполнения').min(8, 'Пароль должен быть не менее 8 символов'),
})

export type ResetPasswordFormType = yup.InferType<typeof resetPasswordSchema>

export const defaultResetPasswordValues = resetPasswordSchema.getDefault()