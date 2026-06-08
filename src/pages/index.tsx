import { lazy } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router';

import { MainLayout, ProtectedRoute } from '@/widgets';

import { ROUTES } from '../shared/config/routes';

const HomePage = lazy(() => import('./home'));
const AuthPage = lazy(() => import('./auth'));
const ProfilePage = lazy(() => import('./profile'));
const FavoritePage = lazy(() => import('./favorite'));
const ChatPage = lazy(() => import('./chat'));
const ApplicationPage = lazy(() => import('./application'));
const ManageApplicationPage = lazy(() => import('./manage-application'));
const MyResponsesPage = lazy(() => import('./my-responses'));
const SettingsLayout = lazy(
  () => import('@/widgets/layouts/ui/settings/SettingsLayout')
);
const SettingsAccountPage = lazy(
  () => import('./settings/ui/account/SettingsAccountPage')
);
const SettingsNotificationPage = lazy(
  () => import('./settings/ui/notification/SettingsNotificationPage')
);

const SettingsGeneralPage = lazy(
  () => import('./settings/ui/general/SettingsGeneralPage')
);
const SettingsMembersPage = lazy(
  () => import('./settings/ui/members/SettingsMembersPage')
);
const SettingsBillingPage = lazy(
  () => import('./settings/ui/billing/SettingsBillingPage')
);
const InvitePage = lazy(() => import('./invite'));

export const Router = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </ProtectedRoute>
        }
        children={
          <>
            <Route
              path={`${ROUTES.INDEX}`}
              element={<HomePage />}
            />

            <Route
              path={`${ROUTES.PROFILE}`}
              element={<ProfilePage />}
            />

            <Route
              path={`${ROUTES.FAVORITES}`}
              element={<FavoritePage />}
            />

            <Route
              path={`${ROUTES.CHAT}`}
              element={<ChatPage />}
            />

            <Route
              path={`${ROUTES.APPLICATION}/:id`}
              element={<ApplicationPage />}
            />

            <Route
              path={`${ROUTES.MANAGE_APPLICATION}`}
              element={<ManageApplicationPage />}
            />

            <Route
              path={`${ROUTES.MY_RESPONSES}`}
              element={<MyResponsesPage />}
            />

            <Route
              path={`${ROUTES.SETTINGS}/*`}
              element={<SettingsLayout />}
            >
              <Route
                index
                element={
                  <Navigate
                    to={ROUTES.SETTINGS_ACCOUNT}
                    replace
                  />
                }
              />
              <Route
                path="account"
                element={<SettingsAccountPage />}
              />
              <Route
                path="notification"
                element={<SettingsNotificationPage />}
              />

              <Route
                path="general"
                element={<SettingsGeneralPage />}
              />
              <Route
                path="members"
                element={<SettingsMembersPage />}
              />
              <Route
                path="billing"
                element={<SettingsBillingPage />}
              />
            </Route>
          </>
        }
      />

      <Route
        path={`${ROUTES.AUTH}`}
        element={<AuthPage />}
      />

      <Route
        path={`${ROUTES.INVITE}`}
        element={<InvitePage />}
      />
    </Routes>
  );
};
