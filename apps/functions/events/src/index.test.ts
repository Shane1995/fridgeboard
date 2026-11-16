import { LIST_EVENTS_ROUTE } from './constants.ts';
import { handler } from './index.ts';

const route = vi.hoisted(() => vi.fn());
const isMember = vi.hoisted(() => vi.fn());
vi.mock('./endpoints/index.ts', async () => {
  const { LIST_EVENTS_ROUTE: key } = await import('./constants.ts');
  return { ENDPOINTS: new Map([[key, route]]) };
});
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));

const eventFor = (routeKey: string) =>
  ({
    routeKey,
    headers: { 'x-api-origin-verify': 'origin-secret' },
    pathParameters: { householdId: 'hh-1' },
    requestContext: { authorizer: { jwt: { claims: { sub: 'sub-1' } } } },
  }) as unknown as Parameters<typeof handler>[0];

describe('events handler', () => {
  beforeEach(() => {
    route.mockReset().mockResolvedValue({ statusCode: 204 });
    isMember.mockReset().mockResolvedValue(true);
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
  });

  it('answers 404 for an unknown route without checking membership', async () => {
    const result = await handler(eventFor('GET /api/v1/somewhere/else'));

    expect(result.statusCode).toBe(404);
    expect(isMember).not.toHaveBeenCalled();
    expect(route).not.toHaveBeenCalled();
  });

  it('answers 404 not-found for a caller who is not a member', async () => {
    isMember.mockResolvedValue(false);

    const result = await handler(eventFor(LIST_EVENTS_ROUTE));

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-found' });
    expect(route).not.toHaveBeenCalled();
  });

  it('runs the matching route with the household scope for a member', async () => {
    const result = await handler(eventFor(LIST_EVENTS_ROUTE));

    expect(result).toEqual({ statusCode: 204 });
    expect(route).toHaveBeenCalledWith(expect.objectContaining({ scope: { householdId: 'hh-1' } }));
  });
});
