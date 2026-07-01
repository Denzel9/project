import {
  AssignmentLateOutlined,
  EventBusyOutlined,
  FactCheckOutlined,
  PendingActionsOutlined,
  PersonAddAltOutlined,
  WhatshotOutlined,
} from '@mui/icons-material';

import { DASHBOARD_FAST_BUTTON_OPTIONS } from '@/features';

import type { SvgIconComponent } from '@mui/icons-material';

export type DashboardFastCardVariant =
  (typeof DASHBOARD_FAST_BUTTON_OPTIONS)[number];

export type DashboardMetricCardVariant = 'overdue' | 'urgent' | 'checking';

export type DashboardCardVariant =
  | DashboardFastCardVariant
  | DashboardMetricCardVariant;

export const DASHBOARD_METRIC_CARD_OPTIONS: DashboardMetricCardVariant[] = [
  'overdue',
  'urgent',
  'checking',
];

export const DASHBOARD_METRIC_CARD_LABELS: Record<
  DashboardMetricCardVariant,
  string
> = {
  overdue: 'Просроченные',
  urgent: 'Срочные',
  checking: 'На проверке',
};

export type DashboardCardAccentColor = 'primary' | 'warning' | 'info' | 'error';

export const CARD_CONFIG: Record<
  DashboardCardVariant,
  {
    icon: SvgIconComponent;
    accentColor: DashboardCardAccentColor;
  }
> = {
  'pending-action': {
    icon: PendingActionsOutlined,
    accentColor: 'warning',
  },
  'pending-executor-assign': {
    icon: PersonAddAltOutlined,
    accentColor: 'primary',
  },
  'no-executor-assign': {
    icon: AssignmentLateOutlined,
    accentColor: 'info',
  },
  overdue: {
    icon: EventBusyOutlined,
    accentColor: 'error',
  },
  urgent: {
    icon: WhatshotOutlined,
    accentColor: 'warning',
  },
  checking: {
    icon: FactCheckOutlined,
    accentColor: 'info',
  },
};

export type DashboardCardProps = {
  label: string;
  count: number;
  variant: DashboardCardVariant;
  isLoading?: boolean;
  onClick: () => void;
};
