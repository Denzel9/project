import { lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router';

import { MainLayout, ProtectedRoute } from '@/widgets';

import { ROUTES } from '../shared/config/routes';

const HomePage = lazy(() => import('./home'));
const AuthPage = lazy(() => import('./auth'));
const ConfirmEmailPage = lazy(() => import('./auth/ui/ConfirmEmailPage'));
const ProfilePage = lazy(() => import('./profile'));
const FavoritePage = lazy(() => import('./favorite'));
const ChatsPage = lazy(() => import('./chats'));
const ChatPage = lazy(() => import('./chat'));
const PostPage = lazy(() => import('./post'));
const ManageApplicationPage = lazy(() => import('./manage-application'));
const MyResponsesPage = lazy(() => import('./my-responses'));
const MyAnnouncementsPage = lazy(() => import('./my-announcements'));
const SettingsLayout = lazy(
  () => import('./settings/ui/layout/SettingsLayout')
);
const SettingsNotificationPage = lazy(
  () => import('./settings/ui/notification/SettingsNotificationPage')
);
const SettingsAppsPage = lazy(
  () => import('./settings/ui/apps/SettingsAppsPage')
);

const SettingsGeneralPage = lazy(
  () => import('./settings/ui/general/SettingsGeneralPage')
);
const SettingsMembersPage = lazy(
  () => import('./settings/ui/members/SettingsMembersPage')
);
const SettingsProfilesPage = lazy(
  () => import('./settings/ui/profiles/SettingsProfilesPage')
);
const SettingsBillingPage = lazy(
  () => import('./settings/ui/billing/SettingsBillingPage')
);
const SettingsIndexRedirect = lazy(
  () => import('./settings/ui/layout/SettingsIndexRedirect')
);
const InvitePage = lazy(() => import('./invite'));
const SettingsAccountPage = lazy(
  () => import('./settings/ui/account/SettingsAccountPage')
);
const SecurityPage = lazy(() => import('./settings/ui/security/SecurityPage'));
const SettingsCrmDashboardPage = lazy(
  () => import('./settings/ui/crm/SettingsCrmDashboardPage')
);
const MyTasksPage = lazy(() => import('./my-tasks'));
const TaskPage = lazy(() => import('./task'));
const CompanyPostResponses = lazy(() => import('./company-post-respones'));
const DashboardPage = lazy(() => import('./dashboard'));
const CalendarPage = lazy(() => import('./calendar'));
const ExecutorsPage = lazy(() => import('./executors'));
const PublicationsPage = lazy(() => import('./publications'));
const ArchivePage = lazy(() => import('./archive'));
const TemplatesPage = lazy(() => import('./templates'));
const UserAgreementPage = lazy(() =>
  import('./legal').then(module => ({ default: module.UserAgreementPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./legal').then(module => ({ default: module.PrivacyPolicyPage }))
);

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
              path={ROUTES.INDEX}
              element={<HomePage />}
            />

            <Route
              path={ROUTES.PROFILE}
              element={<ProfilePage />}
            />

            <Route
              path={ROUTES.FAVORITES}
              element={<FavoritePage />}
            />

            <Route
              path={ROUTES.CHATS}
              element={<ChatsPage />}
            />

            <Route
              path={ROUTES.CHAT}
              element={<ChatPage />}
            />

            <Route
              path={`${ROUTES.POST}/:id`}
              element={<PostPage />}
            />

            <Route
              path={ROUTES.MANAGE_APPLICATION}
              element={<ManageApplicationPage />}
            />

            <Route
              path={ROUTES.MY_RESPONSES}
              element={<MyResponsesPage />}
            />

            <Route
              path={ROUTES.MY_ANNOUNCEMENTS}
              element={<MyAnnouncementsPage />}
            />

            <Route
              path={ROUTES.POSTS_RESPONSES}
              element={<CompanyPostResponses />}
            />

            <Route
              path={ROUTES.SETTINGS}
              element={<SettingsLayout />}
            >
              <Route
                index
                element={<SettingsIndexRedirect />}
              />
              <Route
                path={ROUTES.SETTINGS_ACCOUNT}
                element={<SettingsAccountPage />}
              />

              <Route
                path={ROUTES.SETTINGS_PROFILES}
                element={<SettingsProfilesPage />}
              />

              <Route
                path={ROUTES.SETTINGS_SECURITY}
                element={<SecurityPage />}
              />

              <Route
                path={ROUTES.SETTINGS_NOTIFICATION}
                element={<SettingsNotificationPage />}
              />

              <Route
                path={ROUTES.SETTINGS_APPS}
                element={<SettingsAppsPage />}
              />

              <Route
                path={ROUTES.SETTINGS_GENERAL}
                element={<SettingsGeneralPage />}
              />

              <Route
                path={ROUTES.SETTINGS_MEMBERS}
                element={<SettingsMembersPage />}
              />

              <Route
                path={ROUTES.SETTINGS_BILLING}
                element={<SettingsBillingPage />}
              />

              <Route
                path={ROUTES.SETTINGS_CRM}
                element={
                  <ProtectedRoute isPrimeAccount>
                    <SettingsCrmDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </>
        }
      />

      <Route
        element={
          <ProtectedRoute isPrimeAccount>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </ProtectedRoute>
        }
        children={
          <>
            <Route
              path={ROUTES.CRM}
              element={<DashboardPage />}
            />

            <Route
              path={ROUTES.MY_TASKS}
              element={<MyTasksPage />}
            />

            <Route
              path={ROUTES.CALENDAR}
              element={<CalendarPage />}
            />

            <Route
              path={ROUTES.EXECUTORS}
              element={<ExecutorsPage />}
            />

            <Route
              path={ROUTES.PUBLICATIONS}
              element={<PublicationsPage />}
            />

            <Route
              path={ROUTES.ARCHIVE}
              element={<ArchivePage />}
            />

            <Route
              path={ROUTES.TEMPLATES}
              element={<TemplatesPage />}
            />

            <Route
              path={`${ROUTES.TASK}/:id`}
              element={<TaskPage />}
            />
          </>
        }
      />

      <Route
        path={`${ROUTES.AUTH}`}
        element={<AuthPage />}
      />

      <Route
        path={ROUTES.AUTH_CONFIRM_EMAIL}
        element={<ConfirmEmailPage />}
      />

      <Route
        path={`${ROUTES.INVITE}`}
        element={<InvitePage />}
      />

      <Route
        path={ROUTES.USER_AGREEMENT}
        element={<UserAgreementPage />}
      />

      <Route
        path={ROUTES.PRIVACY_POLICY}
        element={<PrivacyPolicyPage />}
      />
    </Routes>
  );
};
