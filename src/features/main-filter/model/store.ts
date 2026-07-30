import { create } from 'zustand';

import { FILTERS_VALUES } from './constants';
import { defaultPostFilterDraft, type PostFilterDraft } from './types';

type MainFilterStore = {
  filters: FILTERS_VALUES[];
  postFilters: PostFilterDraft;
  isOpenMainFilter: boolean;
  isSearchOpen: boolean;
  searchQuery: string;

  setIsOpenMainFilter: (isOpenMainFilter: boolean) => void;
  setIsSearchOpen: (isSearchOpen: boolean) => void;
  setSearchQuery: (searchQuery: string) => void;
  setFilters: (filters: FILTERS_VALUES[]) => void;
  setPostFilters: (postFilters: PostFilterDraft) => void;
  resetPostFilters: () => void;
  resetAllFilters: () => void;
};

export const useMainFilterStore = create<MainFilterStore>(set => ({
  filters: [],
  postFilters: defaultPostFilterDraft,
  isOpenMainFilter: false,
  isSearchOpen: false,
  searchQuery: '',

  setIsOpenMainFilter: (isOpenMainFilter: boolean) => set({ isOpenMainFilter }),
  setIsSearchOpen: (isSearchOpen: boolean) =>
    set(
      isSearchOpen
        ? { isSearchOpen: true }
        : { isSearchOpen: false, searchQuery: '' }
    ),
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setFilters: (filters: FILTERS_VALUES[]) => set({ filters }),
  setPostFilters: (postFilters: PostFilterDraft) => set({ postFilters }),
  resetPostFilters: () => set({ postFilters: defaultPostFilterDraft }),
  resetAllFilters: () =>
    set({ filters: [], postFilters: defaultPostFilterDraft }),
}));
