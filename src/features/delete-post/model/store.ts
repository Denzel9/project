import { create } from 'zustand';

type DeletePostDialogStore = {
  isOpen: boolean;
  postId: string | null;
  openDeletePostDialog: (postId: string) => void;
  closeDeletePostDialog: () => void;
};

export const useDeletePostDialogStore = create<DeletePostDialogStore>(set => ({
  isOpen: false,
  postId: null,
  openDeletePostDialog: postId => set({ isOpen: true, postId }),
  closeDeletePostDialog: () => set({ isOpen: false, postId: null }),
}));
