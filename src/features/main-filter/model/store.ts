import { create } from 'zustand';

import { POST_TYPE_ENUM } from '@/entities/post';

import { FILTERS_VALUES } from './constants';

type MainFilterStore = {
  filters: FILTERS_VALUES[];
  isOpenMainFilter: boolean;
  postsType: POST_TYPE_ENUM;

  setIsOpenMainFilter: (isOpenMainFilter: boolean) => void;
  setFilters: (filters: FILTERS_VALUES[]) => void;
  setPostsType: (postsType: POST_TYPE_ENUM) => void;
};

export const useMainFilterStore = create<MainFilterStore>(set => ({
  filters: [],
  isOpenMainFilter: false,
  postsType: POST_TYPE_ENUM.ALL,

  setIsOpenMainFilter: (isOpenMainFilter: boolean) => set({ isOpenMainFilter }),
  setFilters: (filters: FILTERS_VALUES[]) => set({ filters }),
  setPostsType: (postsType: POST_TYPE_ENUM) => set({ postsType }),
}));