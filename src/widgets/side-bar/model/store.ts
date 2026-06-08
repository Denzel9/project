import { create } from 'zustand'

type SideBarStore = {
    isOpenSideBar: boolean,
    setIsOpenSideBar: (isOpen: boolean) => void,
}

export const useSideBarStore = create<SideBarStore>((set) => ({
    isOpenSideBar: true,
    setIsOpenSideBar: (isOpenSideBar: boolean) => set({ isOpenSideBar }),
}))