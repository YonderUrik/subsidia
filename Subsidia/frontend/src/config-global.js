// routes
import { PATH_APP } from './routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API_KEY = process.env.REACT_APP_HOST_API_KEY || 'https://subsidia.page/api';

export const MAP_API = process.env.REACT_APP_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = PATH_APP.home;

// LAYOUT
// ----------------------------------------------------------------------

export const HEADER = {
  H_MOBILE: 30,
  H_MAIN_DESKTOP: 30,
  H_DASHBOARD_DESKTOP: 15,
  H_DASHBOARD_DESKTOP_OFFSET: 52 - 32,
};

export const NAV = {
  W_BASE: 260,
  W_LARGE: 320,
  W_DASHBOARD: 280,
  W_DASHBOARD_MINI: 88,
  //
  H_DASHBOARD_ITEM: 48,
  H_DASHBOARD_ITEM_SUB: 36,
  //
  H_DASHBOARD_ITEM_HORIZONTAL: 32,
};

export const ICON = {
  NAV_ITEM: 24,
  NAV_ITEM_HORIZONTAL: 22,
  NAV_ITEM_MINI: 22,
};
