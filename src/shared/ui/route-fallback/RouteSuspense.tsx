import { Suspense, type ReactNode } from 'react';

import { RouteFallback } from './RouteFallback';

type RouteSuspenseProps = {
  children: ReactNode;
};

export const RouteSuspense = ({ children }: RouteSuspenseProps) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

export default RouteSuspense;
