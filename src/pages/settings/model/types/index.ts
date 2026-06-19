import type { User } from '@/entities/user';
import type { ReactNode } from 'react';

export type SettingsMenuItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

export type SettingsMenuSection = {
  title: string;
  items: SettingsMenuItem[];
};


export type Snackbar = {
  open: boolean;
  message: string;
};


export type ProfileSectionProps = {
  user?: User;
};