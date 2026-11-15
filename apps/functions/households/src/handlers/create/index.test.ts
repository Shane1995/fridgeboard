import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { createHousehold } from './index.ts';

const createHouseholdRecord = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/households/index.ts', () => ({
  createHouseholdRecord,
}));
vi.mock('node:crypto', () => ({ randomUUID: () => 'hh-new' }));

const client = {} as DynamoDBDocumentClient;

const userFor = (body: unknown, groups: string[] = []) =>
  ({
    sub: 'sub-1',
    claims: { 'cognito:groups': groups },
    event: { body: JSON.stringify(body), isBase64Encoded: false },
  }) as unknown as AuthenticatedUser;

describe('createHousehold', () => {
  beforeEach(() => {
    createHouseholdRecord.mockReset().mockResolvedValue('created');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-15T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the household for the caller and answers 201 with its location', async () => {
    const result = await createHousehold(userFor({ name: '  Home ' }), client);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body ?? '')).toEqual({ id: 'hh-new', name: 'Home', role: 'owner' });
    expect(result.headers).toMatchObject({ Location: '/api/v1/households/hh-new' });
    expect(createHouseholdRecord).toHaveBeenCalledWith({
      client,
      id: 'hh-new',
      sub: 'sub-1',
      name: 'Home',
      isAdmin: false,
      now: '2026-11-15T00:00:00.000Z',
    });
  });

  it('creates it as an admin when the caller is in the admin group', async () => {
    await createHousehold(userFor({ name: 'Home' }, ['admin']), client);

    expect(createHouseholdRecord).toHaveBeenCalledWith(expect.objectContaining({ isAdmin: true }));
  });

  it.each([{}, { name: '' }, { name: '   ' }, { name: 'x'.repeat(41) }])(
    'refuses an invalid name %j',
    async (body) => {
      const result = await createHousehold(userFor(body), client);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-name' });
      expect(createHouseholdRecord).not.toHaveBeenCalled();
    },
  );

  it('answers 403 when the caller may not create a household', async () => {
    createHouseholdRecord.mockResolvedValue('not-allowed');

    const result = await createHousehold(userFor({ name: 'Home' }), client);

    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-allowed' });
  });

  it('answers 409 when the caller already owns a household', async () => {
    createHouseholdRecord.mockResolvedValue('household-exists');

    const result = await createHousehold(userFor({ name: 'Home' }), client);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'household-exists' });
  });

  it('rethrows any other failure', async () => {
    createHouseholdRecord.mockRejectedValue(new Error('boom'));

    await expect(createHousehold(userFor({ name: 'Home' }), client)).rejects.toThrow('boom');
  });
});
