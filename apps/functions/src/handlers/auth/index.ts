import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import {
  REFRESH_ROUTE,
  ROUTE_FAILED_LOG,
  SIGN_OUT_ROUTE,
  START_ROUTE,
  UNKNOWN_ERROR,
  VERIFY_ROUTE,
} from './constants.ts';
import { refresh } from './routes/refresh/index.ts';
import { signOut } from './routes/signOut/index.ts';
import { start } from './routes/start/index.ts';
import { verify } from './routes/verify/index.ts';
import type { Route } from './types.ts';
import { isTrustedRequest } from './utils/csrf/index.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { loadSecrets } from './utils/loadSecrets/index.ts';

const ROUTES = new Map<string, Route>([
  [START_ROUTE, start],
  [VERIFY_ROUTE, verify],
  [REFRESH_ROUTE, refresh],
  [SIGN_OUT_ROUTE, signOut],
]);

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  if (!isTrustedRequest(event.headers, process.env.APP_ORIGIN ?? '')) {
    return jsonResponse(403, { reason: 'forbidden' });
  }

  const route = ROUTES.get(event.routeKey);
  if (!route) {
    return { statusCode: 404 };
  }

  try {
    return await route(event, await loadSecrets());
  } catch (error) {
    console.error(ROUTE_FAILED_LOG, error instanceof Error ? error.name : UNKNOWN_ERROR);
    return { statusCode: 500 };
  }
};
