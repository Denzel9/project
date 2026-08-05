import { Navigate } from 'react-router';

import { ROUTES } from '@/shared/config/routes';

export const SettingsIndexRedirect = () => (
  <Navigate
    to={ROUTES.SETTINGS_ACCOUNT}
    replace
  />
);

export default SettingsIndexRedirect;
