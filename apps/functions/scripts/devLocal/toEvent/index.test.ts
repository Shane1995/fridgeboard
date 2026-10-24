import { ORIGIN_HEADER, ORIGIN_SECRET } from '../constants.ts';
import { toEvent } from './index.ts';

const request = (headers: Record<string, string>) => ({ method: 'PUT', headers });

describe('toEvent', () => {
  it('adds the origin secret, splits cookies and carries the claims', () => {
    const event = toEvent(
      {
        request: request({ cookie: 'a=1; b=2' }),
        body: '{"x":1}',
        path: '/api/v1/me',
        routeKey: 'PUT /api/v1/me',
        pathParameters: {},
      },
      { sub: 's1', email: 'a@x.com', groups: ['admin'] },
    );

    expect(event.headers[ORIGIN_HEADER]).toBe(ORIGIN_SECRET);
    expect(event.cookies).toEqual(['a=1', 'b=2']);
    expect(event.routeKey).toBe('PUT /api/v1/me');
    expect(event.body).toBe('{"x":1}');
    expect(event.requestContext.authorizer.jwt.claims).toMatchObject({
      sub: 's1',
      'cognito:groups': ['admin'],
    });
  });

  it('passes the matched route key and path parameters', () => {
    const event = toEvent(
      {
        request: request({}),
        body: '',
        path: '/api/v1/households/h1',
        routeKey: 'GET /api/v1/households/{householdId}',
        pathParameters: { householdId: 'h1' },
      },
      undefined,
    );

    expect(event.routeKey).toBe('GET /api/v1/households/{householdId}');
    expect(event.pathParameters).toEqual({ householdId: 'h1' });
  });

  it('omits the body when empty', () => {
    const event = toEvent(
      { request: request({}), body: '', path: '/', routeKey: 'GET /', pathParameters: {} },
      undefined,
    );

    expect(event).not.toHaveProperty('body');
  });
});
