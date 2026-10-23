import { API_PATHS } from '@fridgeboard/contract/auth/constants';

export enum RouteAccess {
  Public = 'public',
  Jwt = 'jwt',
}

export const START_ROUTE = `POST ${API_PATHS.start}`;
export const VERIFY_ROUTE = `POST ${API_PATHS.verify}`;
export const REFRESH_ROUTE = `POST ${API_PATHS.refresh}`;
export const SIGN_OUT_ROUTE = `POST ${API_PATHS.signOut}`;
export const PASSKEY_START_ROUTE = `POST ${API_PATHS.passkeyStart}`;
export const PASSKEY_VERIFY_ROUTE = `POST ${API_PATHS.passkeyVerify}`;
export const PASSKEYS_START_ROUTE = `POST ${API_PATHS.passkeysStart}`;
export const PASSKEYS_COMPLETE_ROUTE = `POST ${API_PATHS.passkeysComplete}`;
export const WEB_AUTHN_CHALLENGE = 'WEB_AUTHN';
export const CREDENTIAL_FIELD = 'credential';
export const ROUTE_FAILED_LOG = 'auth route failed';
export const UNKNOWN_ERROR = 'UnknownError';
