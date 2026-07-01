import { DASHBOARD_FAST_BUTTON_OPTIONS } from '@/features';

import type { DashboardFastCardVariant } from './types';

export const getDashboardActionCardOptions = (
  isCompany: boolean,
): DashboardFastCardVariant[] =>
  DASHBOARD_FAST_BUTTON_OPTIONS.filter(
    option => isCompany || option !== 'no-executor-assign',
  );

export const getDashboardCardGridSize = (count: number) => {
  if (count >= 3) {
    return { xs: 12, sm: 6, md: 4 } as const;
  }

  if (count === 2) {
    return { xs: 12, sm: 6, md: 6 } as const;
  }

  return { xs: 12, sm: 6, md: 12 } as const;
};
