import { create } from 'zustand'

import { type AuthSessionUser, type AuthSliceState } from '../types/types'

const emptyAuth = {
  id: null as string | null,
  accountId: null as string | null,
  role: null as string | null,
  membershipRole: null as string | null,
  isPrime: false,
  primeStatus: null as AuthSliceState['primeStatus'],
  primeExpiresAt: null as string | null,
  isEmailConfirmed: false,
  isAuth: false,
}

export const useAuthStore = create<AuthSliceState>(set => ({
  ...emptyAuth,
  isAuthModalOpen: false,
  setAuth: (user: AuthSessionUser) =>
    set({
      id: user.id,
      accountId: user.accountId,
      role: user.role,
      membershipRole: user.membershipRole,
      isPrime: Boolean(user.isPrime),
      primeStatus: user.primeStatus ?? null,
      primeExpiresAt: user.primeExpiresAt ?? null,
      isEmailConfirmed: Boolean(user.isEmailConfirmed),
      isAuth: true,
    }),
  removeAuth: () => set({ ...emptyAuth }),
  setAuthModalOpen: (isOpen: boolean) => set({ isAuthModalOpen: isOpen }),
}))
