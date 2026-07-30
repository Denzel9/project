import * as yup from 'yup'

const WEAK_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  'qwerty',
  'qwerty123',
  '11111111',
  '00000000',
  'abcdefgh',
  'abcdefg1',
  'iloveyou',
  'admin123',
  'welcome1',
  'letmein1',
])

export const PASSWORD_RULES_HINT = [
  'Не менее 8 символов',
  'Буквы в верхнем и нижнем регистре',
  'Хотя бы одна цифра',
  'Хотя бы один специальный символ (!@#$% и т.п.)',
  'Не используйте слишком простые пароли',
].join('\n\n')

export const validatePassword = (password: string) => {
  if (password.length < 8) {
    return 'Пароль должен быть не менее 8 символов'
  }

  if (!/[a-zа-яё]/.test(password) || !/[A-ZА-ЯЁ]/.test(password)) {
    return 'Пароль должен содержать буквы в разном регистре'
  }

  if (!/\d/.test(password)) {
    return 'Пароль должен содержать цифру'
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return 'Пароль должен содержать специальный символ'
  }

  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return 'Слишком простой пароль'
  }

  return false
}

export const validationEqualPassword = (
  password: string,
  confirmPassword: string,
) => {
  if (password !== confirmPassword) {
    return 'Пароли не совпадают'
  }

  return false
}

export const passwordSchemaField = () =>
  yup
    .string()
    .default('')
    .required('Поле обязательно для заполнения')
    .test('password-strength', '', function testPasswordStrength(value) {
      const error = validatePassword(value ?? '')

      if (error) {
        return this.createError({ message: error })
      }

      return true
    })

export const confirmPasswordSchemaField = (passwordField = 'password') =>
  yup
    .string()
    .default('')
    .required('Поле обязательно для заполнения')
    .oneOf([yup.ref(passwordField)], 'Пароли не совпадают')
