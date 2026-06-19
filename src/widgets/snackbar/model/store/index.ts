import { create } from "zustand";

type SnackbarStore = {
    message: string;
    snackbarOpen: boolean;
    setSnackbarOpen: (snackbarOpen: boolean, message: string) => void;
};

export const useSnackbarStore = create<SnackbarStore>((set) => ({
    message: '',
    snackbarOpen: false,
    setSnackbarOpen: (snackbarOpen: boolean, message: string) => set({ snackbarOpen, message }),
}));