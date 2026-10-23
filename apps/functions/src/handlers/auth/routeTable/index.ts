import {
  PASSKEY_START_ROUTE,
  PASSKEY_VERIFY_ROUTE,
  PASSKEYS_COMPLETE_ROUTE,
  PASSKEYS_START_ROUTE,
  REFRESH_ROUTE,
  RouteAccess,
  SIGN_OUT_ROUTE,
  START_ROUTE,
  VERIFY_ROUTE,
} from '../constants.ts';
import { passkeysComplete } from '../routes/passkeysComplete/index.ts';
import { passkeysStart } from '../routes/passkeysStart/index.ts';
import { passkeyStart } from '../routes/passkeyStart/index.ts';
import { passkeyVerify } from '../routes/passkeyVerify/index.ts';
import { refresh } from '../routes/refresh/index.ts';
import { signOut } from '../routes/signOut/index.ts';
import { start } from '../routes/start/index.ts';
import { verify } from '../routes/verify/index.ts';
import type { RouteEntry } from '../types.ts';

export const ROUTE_TABLE: ReadonlyMap<string, RouteEntry> = new Map<string, RouteEntry>([
  [START_ROUTE, { access: RouteAccess.Public, handler: start }],
  [VERIFY_ROUTE, { access: RouteAccess.Public, handler: verify }],
  [REFRESH_ROUTE, { access: RouteAccess.Public, handler: refresh }],
  [SIGN_OUT_ROUTE, { access: RouteAccess.Public, handler: signOut }],
  [PASSKEY_START_ROUTE, { access: RouteAccess.Public, handler: passkeyStart }],
  [PASSKEY_VERIFY_ROUTE, { access: RouteAccess.Public, handler: passkeyVerify }],
  [PASSKEYS_START_ROUTE, { access: RouteAccess.Jwt, handler: passkeysStart }],
  [PASSKEYS_COMPLETE_ROUTE, { access: RouteAccess.Jwt, handler: passkeysComplete }],
]);
