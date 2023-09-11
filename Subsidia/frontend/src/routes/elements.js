import { Suspense, lazy } from 'react';
// components
import LoadingScreen from '../components/loading-screen';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// ----------------------------------------------------------------------

// AUTH
export const LoginPage = Loadable(lazy(() => import('../pages/auth/LoginPage')));
export const RegisterPage = Loadable(lazy(() => import('../pages/auth/RegisterPage')));
export const ResetPasswordPage = Loadable(lazy(() => import('../pages/auth/ResetPasswordPage')));
export const VerifyCodePage = Loadable(lazy(() => import('../pages/auth/VerifyCodePage')));
export const VerifyCodePageForgot = Loadable(lazy(() => import('../pages/auth/VerifyCodePageForgot')));

// HOME
export const Home = Loadable(lazy(() => import('../pages/Home')));

// RACCOLTE
export const RaccoltePage = Loadable(lazy(() => import('../pages/RaccoltePage')));
export const RaccolteCreateView = Loadable(lazy(() => import('../pages/RaccolteCreatePage')));
export const RaccolteEditPage = Loadable(lazy(() => import('../pages/RaccolteEditPage')));

// DIPENDENTI
export const DipendentiPage = Loadable(lazy(() => import('../pages/DipendentiPage')));

// ERRORS
export const Page404 = Loadable(lazy(() => import('../pages/Page404')));
