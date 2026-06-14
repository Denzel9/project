import { create } from 'zustand'

import type { Application } from '../types'

type ApplicationFormStore = {
  removeApplication: () => void,
  application: Application | null,
  setApplication: (application: Application) => void,
}

export const useApplicationFormStore = create<ApplicationFormStore>((set) => ({
  application: null,
  setApplication: (application: Application) => set({ application }),
  removeApplication: () => set({ application: null }),
}))
