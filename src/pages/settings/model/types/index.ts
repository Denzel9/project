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
