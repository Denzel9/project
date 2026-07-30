import { create } from 'zustand';

import { MY_POST_VIEW_MODE_KEY } from './constants';

import type { ApplicationPostTypeFilter, ApplicationStatusFilter } from './utils';
import type { MyPostViewMode } from './types';
import type { ApplicationList } from '@/entities';

type MyPostFilterStore = {
  q: string;
  posts?: ApplicationList;
  postId: string;
  userId: string;
  type: ApplicationPostTypeFilter;
  updatedDate: string | null;
  status: ApplicationStatusFilter;
  viewMode: MyPostViewMode;
  isOpenFilter: boolean;

  setQ: (q: string) => void;
  setPosts: (posts: ApplicationList) => void;
  setPostId: (postId: string) => void;
  setUserId: (userId: string) => void;
  setType: (type: ApplicationPostTypeFilter) => void;
  setStatus: (status: ApplicationStatusFilter) => void;
  setUpdatedDate: (updatedDate: string | null) => void;
  setViewMode: (viewMode: MyPostViewMode) => void;
  setIsOpenFilter: (isOpenFilter: boolean) => void;
  resetFilters: () => void;
};

const getInitialViewMode = (): MyPostViewMode => {
  const saved = localStorage.getItem(MY_POST_VIEW_MODE_KEY);

  if (saved === 'grid' || saved === 'table') return saved;

  return 'grid';
};

const defaultFilters = {
  q: '',
  postId: 'all',
  userId: 'all',
  type: 'all' as ApplicationPostTypeFilter,
  status: 'all' as ApplicationStatusFilter,
  updatedDate: null,
};

export const useMyPostFilterStore = create<MyPostFilterStore>(set => ({
  ...defaultFilters,
  posts: undefined,
  viewMode: getInitialViewMode(),
  isOpenFilter: false,

  setQ: q => set({ q }),
  setPosts: posts => set({ posts }),
  setPostId: postId => set({ postId }),
  setUserId: userId => set({ userId }),
  setType: type => set({ type }),
  setStatus: status => set({ status }),
  setUpdatedDate: updatedDate => set({ updatedDate }),
  setViewMode: viewMode => {
    localStorage.setItem(MY_POST_VIEW_MODE_KEY, viewMode);
    set({ viewMode });
  },
  setIsOpenFilter: isOpenFilter => set({ isOpenFilter }),
  resetFilters: () => set(defaultFilters),
}));

/** @deprecated use useMyPostFilterStore */
export const useManagePostFilterStore = useMyPostFilterStore;
