import { create } from 'zustand';

import type { ApplicationPostTypeFilter, ApplicationStatusFilter } from './utils';
import type { ApplicationList } from '@/entities';

type MyPostFilterStore = {
  q: string;
  posts?: ApplicationList;
  postId: string;
  type: ApplicationPostTypeFilter;
  updatedDate: string | null;
  status: ApplicationStatusFilter;
  isOpenFilter: boolean;

  setQ: (q: string) => void;
  setPosts: (posts: ApplicationList) => void;
  setPostId: (postId: string) => void;
  setType: (type: ApplicationPostTypeFilter) => void;
  setStatus: (status: ApplicationStatusFilter) => void;
  setUpdatedDate: (updatedDate: string | null) => void;
  setIsOpenFilter: (isOpenFilter: boolean) => void;
  resetFilters: () => void;
};

const defaultFilters = {
  q: '',
  postId: 'all',
  type: 'all' as ApplicationPostTypeFilter,
  status: 'all' as ApplicationStatusFilter,
  updatedDate: null,
};

export const useMyPostFilterStore = create<MyPostFilterStore>(set => ({
  ...defaultFilters,
  posts: undefined,
  isOpenFilter: false,

  setQ: q => set({ q }),
  setPosts: posts => set({ posts }),
  setPostId: postId => set({ postId }),
  setType: type => set({ type }),
  setStatus: status => set({ status }),
  setUpdatedDate: updatedDate => set({ updatedDate }),
  setIsOpenFilter: isOpenFilter => set({ isOpenFilter }),
  resetFilters: () => set(defaultFilters),
}));

/** @deprecated use useMyPostFilterStore */
export const useManagePostFilterStore = useMyPostFilterStore;
