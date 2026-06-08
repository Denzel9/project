import { create } from "zustand";

import type { User } from "@/entities/user";

type ProfileStore = {
    isMe: boolean;
    isEdit: boolean;
    user: User | null;

    setIsMe: (isMe: boolean) => void;
    setIsEdit: (isEdit: boolean) => void;
    setUser: (user: User | null) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
    user: null,
    isMe: false,
    isEdit: false,

    setIsEdit: (isEdit) => set({ isEdit }),
    setIsMe: (isMe: boolean) => set({ isMe }),
    setUser: (user: User | null) => set({ user }),
}));