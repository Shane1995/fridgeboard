import { matchRoute } from './index.ts';

const handler = async () => ({ statusCode: 200 });
const routes = new Map([
  ['GET /api/v1/me', { jwt: true, handler }],
  ['GET /api/v1/{section}', { jwt: false, handler }],
  ['GET /api/v1/households/{householdId}/lists/{listId}/items', { jwt: true, handler }],
  ['POST /api/v1/households', { jwt: true, handler }],
]);

describe('matchRoute', () => {
  it('matches a literal route', () => {
    expect(matchRoute(routes, 'GET', '/api/v1/me')?.routeKey).toBe('GET /api/v1/me');
  });

  it('prefers the route with fewer parameters', () => {
    expect(matchRoute(routes, 'GET', '/api/v1/me')?.pathParameters).toEqual({});
    expect(matchRoute(routes, 'GET', '/api/v1/other')?.pathParameters).toEqual({
      section: 'other',
    });
  });

  it('extracts and decodes path parameters', () => {
    const match = matchRoute(routes, 'GET', '/api/v1/households/h%201/lists/l1/items');

    expect(match?.routeKey).toBe('GET /api/v1/households/{householdId}/lists/{listId}/items');
    expect(match?.pathParameters).toEqual({ householdId: 'h 1', listId: 'l1' });
  });

  it('respects the method and segment count', () => {
    expect(matchRoute(routes, 'DELETE', '/api/v1/me')).toBeUndefined();
    expect(matchRoute(routes, 'GET', '/api/v1/households/h1/lists')).toBeUndefined();
  });
});
