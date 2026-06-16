import { create } from 'zustand';

type ApplicationItemStore = {
  isOpenAddToCollectionDialog: boolean;
  addToCollectionPostId: string | null;
  setOpenAddToCollectionDialog: (
    open: boolean,
    postId: string | null,
  ) => void;
};

export const useApplicationItemStore = create<ApplicationItemStore>(set => ({
  isOpenAddToCollectionDialog: false,
  addToCollectionPostId: null,
  setOpenAddToCollectionDialog: (open: boolean, postId: string | null) =>
    set({
      isOpenAddToCollectionDialog: open,
      addToCollectionPostId: postId,
    }),
}));
