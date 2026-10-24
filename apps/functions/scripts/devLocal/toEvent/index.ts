import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { ORIGIN_HEADER, ORIGIN_SECRET } from '../constants.ts';
import type { LocalClaims } from '../types.ts';
import type { ToEventInput } from './types.ts';

export const toEvent = (
  { request, body, path, routeKey, pathParameters }: ToEventInput,
  claims: LocalClaims | undefined,
): APIGatewayProxyEventV2WithJWTAuthorizer => {
  const method = request.method ?? 'GET';
  const headers = Object.fromEntries(
    Object.entries(request.headers).flatMap(([name, value]) =>
      typeof value === 'string' ? [[name, value]] : [],
    ),
  );
  const jwtClaims: Record<string, string | string[]> = claims
    ? { sub: claims.sub, email: claims.email, 'cognito:groups': claims.groups }
    : {};
  return {
    version: '2.0',
    routeKey,
    rawPath: path,
    rawQueryString: '',
    headers: { ...headers, [ORIGIN_HEADER]: ORIGIN_SECRET },
    cookies: (headers.cookie ?? '')
      .split(';')
      .map((pair) => pair.trim())
      .filter(Boolean),
    ...(body === '' ? {} : { body }),
    ...(Object.keys(pathParameters).length > 0 ? { pathParameters } : {}),
    isBase64Encoded: false,
    requestContext: {
      accountId: 'local',
      apiId: 'local',
      domainName: 'localhost',
      domainPrefix: 'localhost',
      http: {
        method,
        path,
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: headers['user-agent'] ?? '',
      },
      requestId: 'local',
      routeKey: `${method} ${path}`,
      stage: '$default',
      time: '',
      timeEpoch: 0,
      authorizer: {
        principalId: 'local',
        integrationLatency: 0,
        jwt: { claims: jwtClaims, scopes: [] },
      },
    },
  };
};
