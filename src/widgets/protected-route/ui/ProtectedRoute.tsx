import { Navigate } from 'react-router';

import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

import type { ReactNode } from 'react';

export const ProtectedRoute = ({
  children,
  // isPrimeAccount,
}: {
  children: ReactNode;
  isPrimeAccount?: boolean;
}) => {
  const { isAuth } = useAuthStore();

  if (!isAuth) {
    return <Navigate to={ROUTES.AUTH} />;
  }

  return children;
};

export default ProtectedRoute;
