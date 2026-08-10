import { useCallback } from 'react'
import { useNavigate } from 'react-router'

import { useSwitchProfileMutation } from '@/entities/workspace-member'
import { useCurrentUserStore } from '@/features/current-user/model/store'
import { ROUTES } from '@/shared/config/routes'

import { applySwitchedProfileSession } from '../utils/profileSession'

/** Переключение профиля с полной очисткой клиентской сессии. */
export const useSwitchActiveProfile = () => {
  const navigate = useNavigate()
  const setCurrentUser = useCurrentUserStore(state => state.setCurrentUser)
  const { mutateAsync: switchProfile, isPending } = useSwitchProfileMutation()

  const switchActiveProfile = useCallback(
    async (userId: string) => {
      if (!userId) return false

      const res = await switchProfile(userId)
      const user = res.data.user

      if (!user?.id) return false

      const mapped = await applySwitchedProfileSession(user)
      setCurrentUser(mapped.id)
      navigate(ROUTES.INDEX, { replace: true })

      return true
    },
    [navigate, setCurrentUser, switchProfile],
  )

  return { switchActiveProfile, isPending }
}
