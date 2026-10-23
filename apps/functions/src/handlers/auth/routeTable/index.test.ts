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
import { ROUTE_TABLE } from './index.ts';

const EXPECTED_ACCESS: Record<string, RouteAccess> = {
  [START_ROUTE]: RouteAccess.Public,
  [VERIFY_ROUTE]: RouteAccess.Public,
  [REFRESH_ROUTE]: RouteAccess.Public,
  [SIGN_OUT_ROUTE]: RouteAccess.Public,
  [PASSKEY_START_ROUTE]: RouteAccess.Public,
  [PASSKEY_VERIFY_ROUTE]: RouteAccess.Public,
  [PASSKEYS_START_ROUTE]: RouteAccess.Jwt,
  [PASSKEYS_COMPLETE_ROUTE]: RouteAccess.Jwt,
};

describe('ROUTE_TABLE', () => {
  it('holds exactly the expected routes', () => {
    expect([...ROUTE_TABLE.keys()].sort()).toEqual(Object.keys(EXPECTED_ACCESS).sort());
  });

  it.each(Object.entries(EXPECTED_ACCESS))('%s has access %s and a handler', (routeKey, access) => {
    const entry = ROUTE_TABLE.get(routeKey);

    expect(entry?.access).toBe(access);
    expect(entry?.handler).toBeTypeOf('function');
  });
});
