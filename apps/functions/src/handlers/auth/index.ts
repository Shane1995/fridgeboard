import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import {
  PASSKEY_START_ROUTE,
  PASSKEY_VERIFY_ROUTE,
  PASSKEYS_COMPLETE_ROUTE,
  PASSKEYS_START_ROUTE,
  REFRESH_ROUTE,
  ROUTE_FAILED_LOG,
  SIGN_OUT_ROUTE,
  START_ROUTE,
  UNKNOWN_ERROR,
  VERIFY_ROUTE,
} from './constants.ts';
import { passkeysComplete } from './routes/passkeysComplete/index.ts';
import { passkeysStart } from './routes/passkeysStart/index.ts';
import { passkeyStart } from './routes/passkeyStart/index.ts';
import { passkeyVerify } from './routes/passkeyVerify/index.ts';
import { refresh } from './routes/refresh/index.ts';
import { signOut } from './routes/signOut/index.ts';
import { start } from './routes/start/index.ts';
import { verify } from './routes/verify/index.ts';
import type { AuthorizedRoute, Route } from './types.ts';
import { isTrustedRequest } from './utils/csrf/index.ts';
import { hasJwtAuthorizer } from './utils/hasJwtAuthorizer/index.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { withVerifiedOrigin } from '../../utils/originVerified/index.ts';
import { loadSecrets } from './utils/loadSecrets/index.ts';

const ROUTES = new Map<string, Route>([
  [START_ROUTE, start],
  [VERIFY_ROUTE, verify],
  [REFRESH_ROUTE, refresh],
  [SIGN_OUT_ROUTE, signOut],
  [PASSKEY_START_ROUTE, passkeyStart],
  [PASSKEY_VERIFY_ROUTE, passkeyVerify],
]);

const AUTHORIZED_ROUTES = new Map<string, AuthorizedRoute>([
  [PASSKEYS_START_ROUTE, passkeysStart],
  [PASSKEYS_COMPLETE_ROUTE, passkeysComplete],
]);

const run = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  const route = ROUTES.get(event.routeKey);
  if (route) {
    return route(event, await loadSecrets());
  }

  const authorizedRoute = AUTHORIZED_ROUTES.get(event.routeKey);
  if (!authorizedRoute) {
    return { statusCode: 404 };
  }
  return hasJwtAuthorizer(event)
    ? authorizedRoute(event, await loadSecrets())
    : jsonResponse(401, { reason: 'unauthorised' });
};

export const handler = withVerifiedOrigin(
  async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    if (!isTrustedRequest(event.headers, process.env.APP_ORIGIN ?? '')) {
      return jsonResponse(403, { reason: 'forbidden' });
    }

    try {
      return await run(event);
    } catch (error) {
      console.error(ROUTE_FAILED_LOG, error instanceof Error ? error.name : UNKNOWN_ERROR);
      return { statusCode: 500 };
    }
  },
);
