import {
  AssignmentLateOutlined,
  CancelOutlined,
  EventBusyOutlined,
  FactCheckOutlined,
  PendingActionsOutlined,
  PersonAddAltOutlined,
  WhatshotOutlined,
} from '@mui/icons-material';

import type { DashboardCardVariant } from '@/features';
import type { SvgIconComponent } from '@mui/icons-material';

export type { DashboardCardVariant };

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
  cancelled: {
    icon: CancelOutlined,
    accentColor: 'error',
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
