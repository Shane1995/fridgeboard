import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { ROUTE_FAILED_LOG, RouteAccess, UNKNOWN_ERROR } from './constants.ts';
import { ROUTE_TABLE } from './routeTable/index.ts';
import { isTrustedRequest } from './utils/csrf/index.ts';
import { hasJwtAuthorizer } from './utils/hasJwtAuthorizer/index.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { withVerifiedOrigin } from '../../utils/originVerified/index.ts';
import { loadSecrets } from './utils/loadSecrets/index.ts';

const run = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  const entry = ROUTE_TABLE.get(event.routeKey);
  if (!entry) {
    return { statusCode: 404 };
  }
  if (entry.access === RouteAccess.Public) {
    return entry.handler(event, await loadSecrets());
  }
  return hasJwtAuthorizer(event)
    ? entry.handler(event, await loadSecrets())
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
