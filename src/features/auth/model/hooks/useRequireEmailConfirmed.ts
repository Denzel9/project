import axios from 'axios'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'

import { ROUTES } from '@/shared'
import { useSnackbarStore } from '@/widgets'

import { useAuthStore } from '../store/store'

const EMAIL_CONFIRM_MESSAGE =
  'Подтвердите почту, чтобы получить полный доступ'

export const useRequireEmailConfirmed = () => {
  const isEmailConfirmed = useAuthStore(state => state.isEmailConfirmed)
  const { setSnackbarOpen } = useSnackbarStore()
  const navigate = useNavigate()

  const requireEmailConfirmed = useCallback(() => {
    if (isEmailConfirmed) {
      return true
    }

    setSnackbarOpen?.(true, EMAIL_CONFIRM_MESSAGE)
    navigate(ROUTES.SETTINGS_GENERAL)
    return false
  }, [isEmailConfirmed, navigate, setSnackbarOpen])

  return { isEmailConfirmed, requireEmailConfirmed }
}

export const getEmailConfirmErrorMessage = (
  error: unknown,
  fallback = 'Не удалось выполнить действие'
) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
