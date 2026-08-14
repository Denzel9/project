import { Navigate, useLocation } from 'react-router';

import { USER_ROLE } from '@/entities';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

const isExactOrChild = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

/** Пути, закрытые для shell MANAGER */
const getManagerRedirectTarget = (pathname: string): string | null => {
  if (
    pathname === ROUTES.INDEX ||
    isExactOrChild(pathname, ROUTES.FAVORITES) ||
    pathname.startsWith(ROUTES.POST) ||
    pathname === ROUTES.CRM ||
    isExactOrChild(pathname, ROUTES.MY_TASKS)
  ) {
    return ROUTES.CHATS;
  }

  if (
    isExactOrChild(pathname, ROUTES.SETTINGS_MEMBERS) ||
    isExactOrChild(pathname, ROUTES.SETTINGS_BILLING)
  ) {
    return ROUTES.SETTINGS_ACCOUNT;
  }

  return null;
};

export const ManagerShellRedirect = () => {
  const role = useAuthStore(state => state.role);
  const { pathname } = useLocation();

  if (role !== USER_ROLE.MANAGER) {
    return null;
  }

  const target = getManagerRedirectTarget(pathname);
  if (!target) {
    return null;
  }

  return (
    <Navigate
      to={target}
      replace
    />
  );
};
