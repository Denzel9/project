import { create } from "zustand";

import type { CurrentUserStore } from "../types";

export const useCurrentUserStore = create<CurrentUserStore>((set) => ({
    currentUser: '',
    setCurrentUser: (currentUser) => set({ currentUser }),
}))