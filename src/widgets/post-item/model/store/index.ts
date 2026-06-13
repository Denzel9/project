import { create } from "zustand";

type ApplicationItemStore = {
    id: string | null;
    isOpenDeleteDialog: boolean;
    setOpenDeleteDialog: (openDeleteDialog: boolean, id: string | null) => void;
};

export const useApplicationItemStore = create<ApplicationItemStore>((set) => ({
    id: null,
    isOpenDeleteDialog: false,
    setOpenDeleteDialog: (openDeleteDialog: boolean, id: string | null) => set({ isOpenDeleteDialog: openDeleteDialog, id }),
}));