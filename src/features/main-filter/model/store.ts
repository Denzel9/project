import { create } from 'zustand';

import { FILTERS_VALUES } from './constants';

type MainFilterStore = {
  filters: FILTERS_VALUES[];
  isOpenMainFilter: boolean;

  setIsOpenMainFilter: (isOpenMainFilter: boolean) => void;
  setFilters: (filters: FILTERS_VALUES[]) => void;
};

export const useMainFilterStore = create<MainFilterStore>(set => ({
  filters: [],
  isOpenMainFilter: false,

  setIsOpenMainFilter: (isOpenMainFilter: boolean) => set({ isOpenMainFilter }),
  setFilters: (filters: FILTERS_VALUES[]) => set({ filters }),
}));