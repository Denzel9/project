import { create } from 'zustand';

import type { ApplicationStatusFilter } from './utils';
import type { ApplicationList } from '@/entities';

type ManagePostFilterStore = {
  q?: string;
  posts?: ApplicationList
  updatedDate: string | null;
  status: ApplicationStatusFilter;

  setQ: (q: string) => void;
  setPosts: (posts: ApplicationList) => void;
  setStatus: (status: ApplicationStatusFilter) => void;
  setUpdatedDate: (updatedDate: string | null) => void;
};

export const useManagePostFilterStore = create<ManagePostFilterStore>(set => ({
  q: 'all',
  status: 'all',
  updatedDate: null,
  posts: undefined,

  setQ: q => set({ q }),
  setPosts: posts => set({ posts }),
  setStatus: status => set({ status }),
  setUpdatedDate: updatedDate => set({ updatedDate }),
}));
