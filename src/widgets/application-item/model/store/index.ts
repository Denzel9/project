import { create } from "zustand";

type ApplicationItemStore = {
    isOpenDeleteDialog: boolean;
    setOpenDeleteDialog: (openDeleteDialog: boolean) => void;
};

export const useApplicationItemStore = create<ApplicationItemStore>((set) => ({
    isOpenDeleteDialog: false,
    setOpenDeleteDialog: (openDeleteDialog: boolean) => set({ isOpenDeleteDialog: openDeleteDialog }),
}));