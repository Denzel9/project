import { create } from 'zustand';

type ApplicationItemStore = {
  id: string | null;
  isOpenDeleteDialog: boolean;
  isOpenAddToCollectionDialog: boolean;
  addToCollectionPostId: string | null;
  setOpenDeleteDialog: (openDeleteDialog: boolean, id: string | null) => void;
  setOpenAddToCollectionDialog: (
    open: boolean,
    postId: string | null,
  ) => void;
};

export const useApplicationItemStore = create<ApplicationItemStore>(set => ({
  id: null,
  isOpenDeleteDialog: false,
  isOpenAddToCollectionDialog: false,
  addToCollectionPostId: null,
  setOpenDeleteDialog: (openDeleteDialog: boolean, id: string | null) =>
    set({ isOpenDeleteDialog: openDeleteDialog, id }),
  setOpenAddToCollectionDialog: (open: boolean, postId: string | null) =>
    set({
      isOpenAddToCollectionDialog: open,
      addToCollectionPostId: postId,
    }),
}));
