import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { ORIGIN_SECRET } from '../constants.ts';
import type { BuildEventOptions } from './types.ts';

export const buildEvent = ({
  claims,
  body,
  method = 'GET',
  path = '/',
  pathParameters,
  query,
  headers = { 'x-api-origin-verify': ORIGIN_SECRET },
}: BuildEventOptions): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: `${method} ${path}`,
  rawPath: path,
  rawQueryString: '',
  ...(pathParameters === undefined ? {} : { pathParameters }),
  ...(query === undefined ? {} : { queryStringParameters: query }),
  headers,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  isBase64Encoded: false,
  requestContext: {
    accountId: '123',
    apiId: 'api',
    domainName: 'app.fridgeboard.uk',
    domainPrefix: 'app',
    http: { method, path, protocol: 'HTTP/1.1', sourceIp: '127.0.0.1', userAgent: 'integration' },
    requestId: 'req-1',
    routeKey: `${method} ${path}`,
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: { principalId: 'p', integrationLatency: 0, jwt: { claims, scopes: [] } },
  },
});
