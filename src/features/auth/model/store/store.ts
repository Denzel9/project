import { create } from 'zustand'

import { type AuthSliceState } from '../types/types'

export const useAuthStore = create<AuthSliceState>((set) => ({
  isAuth: false,
  id: null,
  isAuthModalOpen: false,
  setAuth: (id: string,) => set({ id, isAuth: true, }),
  removeAuth: () => set({ id: null, isAuth: false, }),
  //возможно не используется
  setAuthModalOpen: (isOpen: boolean) => set({ isAuthModalOpen: isOpen }),
}))
