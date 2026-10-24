import { readFileSync } from 'node:fs';
import type { ServerResponse } from 'node:http';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { WebConfigurationSchema } from '@fridgeboard/contract/configuration/web';
import { jsonResponse } from '../../../src/utils/jsonResponse/index.ts';
import { CONFIGURATION_FILE } from '../constants.ts';
import { decodeToken } from '../decodeToken/index.ts';
import { readBody } from '../readBody/index.ts';
import { matchRoute } from '../matchRoute/index.ts';
import { buildRoutes } from '../route/index.ts';
import { sendResult } from '../sendResult/index.ts';
import { servedConfiguration } from '../servedConfiguration/index.ts';
import { toEvent } from '../toEvent/index.ts';
import type { LocalRequest } from './types.ts';

const dispatch = async (
  request: LocalRequest,
  routeKey: string,
  path: string,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const configuration = readFileSync(CONFIGURATION_FILE, 'utf8');
  if (routeKey === 'GET /configuration.json') {
    return servedConfiguration(configuration);
  }
  const { api } = WebConfigurationSchema.parse(JSON.parse(configuration)).services;
  const match = matchRoute(buildRoutes(api), request.method ?? '', path);
  if (!match) {
    return { statusCode: 404 };
  }
  const { entry, pathParameters } = match;
  const claims = decodeToken(request.headers.authorization?.replace(/^Bearer /i, ''));
  if (entry.jwt && !claims) {
    return jsonResponse(401, { reason: 'unauthorised' });
  }
  return entry.handler(
    toEvent(
      {
        request,
        body: await readBody(request),
        path,
        routeKey: match.routeKey,
        pathParameters,
      },
      claims,
    ),
  );
};

export const handleRequest = async (
  request: LocalRequest,
  response: Pick<ServerResponse, 'writeHead' | 'end'>,
): Promise<void> => {
  const { pathname: path } = new URL(request.url ?? '/', 'http://localhost');
  const routeKey = `${request.method} ${path}`;
  try {
    const result = await dispatch(request, routeKey, path);
    console.log(`${routeKey} -> ${result.statusCode}`);
    sendResult(response, result);
  } catch (error) {
    console.error(`${routeKey} failed`, error);
    sendResult(response, { statusCode: 500 });
  }
};
