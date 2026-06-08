import { create } from "zustand";

import type { CurrentUserStore } from "../types";

export const useCurrentUserStore = create<CurrentUserStore>((set) => ({
    currentUser: null,
    setCurrentUser: (currentUser) => set({ currentUser }),
}))