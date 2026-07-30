import { Navigate } from 'react-router';

import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

import type { ReactNode } from 'react';

export const ProtectedRoute = ({
  children,
  isPrimeAccount,
}: {
  children: ReactNode;
  isPrimeAccount?: boolean;
}) => {
  const { isAuth, isPrime } = useAuthStore();

  if (!isAuth) {
    return <Navigate to={ROUTES.AUTH} />;
  }

  if (isPrimeAccount && !isPrime) {
    return <Navigate to={ROUTES.SETTINGS_BILLING} replace />;
  }

  return children;
};

export default ProtectedRoute;
