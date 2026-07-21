import { create } from "zustand";

type SnackbarStore = {
    message: string;
    snackbarOpen: boolean;
    severity: 'success' | 'error' | 'warning' | 'info';
    setSnackbarOpen: (snackbarOpen: boolean, message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
};

export const useSnackbarStore = create<SnackbarStore>((set) => ({
    message: '',
    snackbarOpen: false,
    severity: 'info',
    setSnackbarOpen: (snackbarOpen: boolean, message: string, severity?: 'success' | 'error' | 'warning' | 'info') => set({ snackbarOpen, message, severity }),
}));