import { create } from 'zustand'

import { type AuthSliceState } from '../types/types'

export const useAuthStore = create<AuthSliceState>((set) => ({
  isAuth: false,
  id: null,
  role: null,
  membershipRole: null,
  isAuthModalOpen: false,
  setAuth: (id: string, role: string, membershipRole: string) => set({ id, isAuth: true, role, membershipRole }),
  removeAuth: () => set({ id: null, isAuth: false, }),
  //возможно не используется
  setAuthModalOpen: (isOpen: boolean) => set({ isAuthModalOpen: isOpen }),
}))
