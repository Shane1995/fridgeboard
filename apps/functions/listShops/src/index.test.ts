import { LIST_SHOPS_ROUTE } from './constants.ts';
import { handler } from './index.ts';

const route = vi.hoisted(() => vi.fn());
const isMember = vi.hoisted(() => vi.fn());
vi.mock('./endpoints/index.ts', async () => {
  const { LIST_SHOPS_ROUTE: key } = await import('./constants.ts');
  return { ENDPOINTS: new Map([[key, route]]) };
});
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));

const eventFor = (routeKey: string) =>
  ({
    routeKey,
    headers: { 'x-api-origin-verify': 'origin-secret' },
    pathParameters: { householdId: 'hh-1', listId: 'main' },
    requestContext: { authorizer: { jwt: { claims: { sub: 'sub-1' } } } },
  }) as unknown as Parameters<typeof handler>[0];

describe('list shops handler', () => {
  beforeEach(() => {
    route.mockReset().mockResolvedValue({ statusCode: 204 });
    isMember.mockReset().mockResolvedValue(true);
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
  });

  it('answers 404 for a route that is not in the table without checking membership', async () => {
    const result = await handler(eventFor('GET /api/v1/somewhere/else'));

    expect(result.statusCode).toBe(404);
    expect(isMember).not.toHaveBeenCalled();
    expect(route).not.toHaveBeenCalled();
  });

  it('answers 404 not-found when the caller is not a member of the household', async () => {
    isMember.mockResolvedValue(false);

    const result = await handler(eventFor(LIST_SHOPS_ROUTE));

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-found' });
    expect(route).not.toHaveBeenCalled();
  });

  it('runs the matching route with the caller’s list scope when they are a member', async () => {
    const result = await handler(eventFor(LIST_SHOPS_ROUTE));

    expect(result).toEqual({ statusCode: 204 });
    expect(isMember).toHaveBeenCalledWith(
      expect.objectContaining({ householdId: 'hh-1', sub: 'sub-1' }),
    );
    expect(route).toHaveBeenCalledWith(
      expect.objectContaining({ scope: { householdId: 'hh-1', listId: 'main' } }),
    );
  });
});
