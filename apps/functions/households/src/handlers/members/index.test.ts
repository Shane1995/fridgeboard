import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { HouseholdRole } from '@fridgeboard/lambda-kit/utils/isHouseholdRole/constants.ts';
import { listMembers } from './index.ts';

const isMember = vi.hoisted(() => vi.fn());
const queryMemberships = vi.hoisted(() => vi.fn());
const getUsernames = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));
vi.mock('@fridgeboard/lambda-kit/repository/households/index.ts', () => ({
  queryMemberships,
  getUsernames,
}));

const client = {} as DynamoDBDocumentClient;
const userFor = ({
  sub = 'sub-1',
  claims = {},
  pathParameters,
  query,
  body,
}: {
  sub?: string;
  claims?: Record<string, unknown>;
  pathParameters?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}) =>
  ({
    sub,
    claims,
    event: {
      pathParameters,
      queryStringParameters: query,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
  }) as unknown as AuthenticatedUser;

const call = (householdId?: string) =>
  listMembers(
    userFor({ pathParameters: householdId === undefined ? {} : { householdId } }),
    client,
  );

describe('listMembers', () => {
  beforeEach(() => {
    isMember.mockReset().mockResolvedValue(true);
    queryMemberships.mockReset().mockResolvedValue([]);
    getUsernames.mockReset().mockResolvedValue(new Map());
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('lists the owner first, then the others by username', async () => {
    queryMemberships.mockResolvedValue([
      { SK: 'MEMBER#u1', role: HouseholdRole.Member },
      { SK: 'MEMBER#u2', role: HouseholdRole.Owner },
      { SK: 'MEMBER#u3', role: HouseholdRole.Member },
    ]);
    getUsernames.mockResolvedValue(
      new Map([
        ['u1', 'zed'],
        ['u2', 'zoe'],
        ['u3', 'amy'],
      ]),
    );

    const result = await call('hh-1');

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({
      members: [
        { id: 'u2', role: 'owner', username: 'zoe' },
        { id: 'u3', role: 'member', username: 'amy' },
        { id: 'u1', role: 'member', username: 'zed' },
      ],
    });
    expect(getUsernames).toHaveBeenCalledWith(
      expect.objectContaining({ subs: ['u1', 'u2', 'u3'] }),
    );
  });

  it('leaves out the username of a member without one and drops an unknown role', async () => {
    queryMemberships.mockResolvedValue([
      { SK: 'MEMBER#u1', role: HouseholdRole.Member },
      { SK: 'MEMBER#u2', role: 'visitor' },
    ]);

    const result = await call('hh-1');

    expect(JSON.parse(result.body ?? '')).toEqual({ members: [{ id: 'u1', role: 'member' }] });
  });

  it.each([
    ['no household id', undefined],
    ['an invalid household id', 'not valid!'],
  ])('answers 404 for %s without checking membership', async (_name, householdId) => {
    const result = await call(householdId);

    expect(result.statusCode).toBe(404);
    expect(isMember).not.toHaveBeenCalled();
  });

  it('answers 404 for someone who is not a member', async () => {
    isMember.mockResolvedValue(false);

    const result = await call('hh-1');

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-found' });
    expect(queryMemberships).not.toHaveBeenCalled();
  });
});
