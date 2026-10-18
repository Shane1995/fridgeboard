import { API_PATHS } from '@fridgeboard/contract';

export const START_ROUTE = `POST ${API_PATHS.start}`;
export const VERIFY_ROUTE = `POST ${API_PATHS.verify}`;
export const REFRESH_ROUTE = `POST ${API_PATHS.refresh}`;
export const SIGN_OUT_ROUTE = `POST ${API_PATHS.signOut}`;
export const ROUTE_FAILED_LOG = 'auth route failed';
export const UNKNOWN_ERROR = 'UnknownError';
