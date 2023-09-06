import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';

import RoleBasedGuard from '../auth/RoleBasedGuard';

// layouts
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config-global';
//
import {
  // AUTH
  ResetPasswordPage,
  LoginPage,
  RegisterPage,
  VerifyCodePage,
  VerifyCodePageForgot,
  // HOME
  Home,
  // Raccolte
  RaccoltePage,
  RaccolteCreateView,
  RaccolteEditPage,
  // ERRORS
  Page404,
} from './elements';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        {
          path: 'login',
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          ),
        },
        {
          element: <CompactLayout />,
          children: [
            { path: 'reset-password', element: <ResetPasswordPage /> },
            { path: 'verify', element: <VerifyCodePage /> },
            { path: 'verify-forgot', element: <VerifyCodePageForgot /> },
          ],
        },
      ],
    },
    {
      path: '/app',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'home', element: <Home /> },
        {
          path: 'raccolte',
          element: (
            <RoleBasedGuard hasContent roles={['raccolte']}>
              <RaccoltePage />
            </RoleBasedGuard>
          ),
        },
        {
          path: 'nuova-raccolta',
          element: (
            <RoleBasedGuard hasContent roles={['raccolte']}>
              <RaccolteCreateView />
            </RoleBasedGuard>
          ),
        },
        {
          path: 'raccolta/:id/modifica',
          element: (
            <RoleBasedGuard hasContent roles={['raccolte']}>
              <RaccolteEditPage />{' '}
            </RoleBasedGuard>
          ),
        },
      ],
    },
    {
      element: <CompactLayout />,
      children: [{ path: '404', element: <Page404 /> }],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
