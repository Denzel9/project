import { create } from 'zustand'

type SideBarStore = {
    isOpenSideBar: boolean,
    setIsOpenSideBar: (isOpen: boolean) => void,
    isMobileDrawerOpen: boolean,
    setMobileDrawerOpen: (isOpen: boolean) => void,
}

export const useSideBarStore = create<SideBarStore>((set) => ({
    isOpenSideBar: true,
    setIsOpenSideBar: (isOpenSideBar: boolean) => set({ isOpenSideBar }),
    isMobileDrawerOpen: false,
    setMobileDrawerOpen: (isMobileDrawerOpen: boolean) => set({ isMobileDrawerOpen }),
}))