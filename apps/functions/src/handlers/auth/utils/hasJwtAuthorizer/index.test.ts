import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyEventV2WithLambdaAuthorizer,
} from 'aws-lambda';
import { hasJwtAuthorizer } from './index.ts';

const base: APIGatewayProxyEventV2 = {
  version: '2.0',
  routeKey: 'k',
  rawPath: '/',
  rawQueryString: '',
  headers: {},
  isBase64Encoded: false,
  requestContext: {
    accountId: '1',
    apiId: 'a',
    domainName: 'd',
    domainPrefix: 'd',
    http: { method: 'POST', path: '/', protocol: 'HTTP/1.1', sourceIp: '1.1.1.1', userAgent: 't' },
    requestId: 'r',
    routeKey: 'k',
    stage: '$default',
    time: '',
    timeEpoch: 0,
  },
};

describe('hasJwtAuthorizer', () => {
  it('is true when the JWT authorizer attached claims', () => {
    const event: APIGatewayProxyEventV2WithJWTAuthorizer = {
      ...base,
      requestContext: {
        ...base.requestContext,
        authorizer: {
          principalId: 'p',
          integrationLatency: 0,
          jwt: { claims: { sub: 's' }, scopes: [] },
        },
      },
    };

    expect(hasJwtAuthorizer(event)).toBe(true);
  });

  it('is false without an authorizer', () => {
    expect(hasJwtAuthorizer(base)).toBe(false);
  });

  it('is false for another kind of authorizer', () => {
    const event: APIGatewayProxyEventV2WithLambdaAuthorizer<{ a: number }> = {
      ...base,
      requestContext: { ...base.requestContext, authorizer: { lambda: { a: 1 } } },
    };

    expect(hasJwtAuthorizer(event)).toBe(false);
  });
});
