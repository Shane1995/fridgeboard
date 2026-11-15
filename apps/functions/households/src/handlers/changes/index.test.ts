import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { listChanges } from './index.ts';

const isMember = vi.hoisted(() => vi.fn());
const getHouseholdRev = vi.hoisted(() => vi.fn());
const queryChanges = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));
vi.mock('@fridgeboard/lambda-kit/repository/households/index.ts', () => ({
  getHouseholdRev,
  queryChanges,
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

const call = (since?: string) =>
  listChanges(
    userFor({
      pathParameters: { householdId: 'hh-1' },
      ...(since === undefined ? {} : { query: { since } }),
    }),
    client,
  );

const body = (result: { body?: string | undefined }) => JSON.parse(result.body ?? '');

describe('listChanges', () => {
  beforeEach(() => {
    isMember.mockReset().mockResolvedValue(true);
    getHouseholdRev.mockReset().mockResolvedValue(10);
    queryChanges.mockReset().mockResolvedValue([]);
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('answers 404 for someone who is not a member', async () => {
    isMember.mockResolvedValue(false);

    const result = await call('3');

    expect(result.statusCode).toBe(404);
    expect(getHouseholdRev).not.toHaveBeenCalled();
  });

  it('refuses a since that is not a number', async () => {
    const result = await call('abc');

    expect(result.statusCode).toBe(400);
    expect(body(result)).toEqual({ reason: 'invalid-request' });
  });

  it('answers a snapshot with the revision when the client has none', async () => {
    const result = await call();

    expect(body(result)).toEqual({ rev: 10, snapshot: true });
    expect(queryChanges).not.toHaveBeenCalled();
  });

  it('answers a snapshot when the client is ahead of the household', async () => {
    const result = await call('11');

    expect(body(result)).toEqual({ rev: 10, snapshot: true });
    expect(queryChanges).not.toHaveBeenCalled();
  });

  it('answers a snapshot when the client is further behind than the feed keeps', async () => {
    getHouseholdRev.mockResolvedValue(101);

    const result = await call('0');

    expect(body(result)).toEqual({ rev: 101, snapshot: true });
    expect(queryChanges).not.toHaveBeenCalled();
  });

  it('answers no changes when the client is up to date', async () => {
    const result = await call('10');

    expect(body(result)).toEqual({ rev: 10, changes: [] });
    expect(queryChanges).not.toHaveBeenCalled();
  });

  it('lists the changes after the revision the client has seen', async () => {
    queryChanges.mockResolvedValue([
      { PK: 'HH#hh-1', SK: 'CHG#0000000009', rev: 9, type: 'item', id: 'i1' },
      { PK: 'HH#hh-1', SK: 'CHG#0000000010', rev: 10, type: 'shop', id: 's1' },
    ]);

    const result = await call('8');

    expect(body(result)).toEqual({
      rev: 10,
      changes: [
        { rev: 9, type: 'item', id: 'i1' },
        { rev: 10, type: 'shop', id: 's1' },
      ],
    });
    expect(queryChanges).toHaveBeenCalledWith(
      expect.objectContaining({ householdId: 'hh-1', from: 9, to: 10 }),
    );
  });

  it('answers a snapshot when some changes have expired', async () => {
    queryChanges.mockResolvedValue([{ rev: 10, type: 'item', id: 'i1' }]);

    const result = await call('8');

    expect(body(result)).toEqual({ rev: 10, snapshot: true });
  });
});
