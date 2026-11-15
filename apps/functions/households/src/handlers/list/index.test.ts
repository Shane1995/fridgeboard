import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { listMyHouseholds } from './index.ts';

const listHouseholds = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/households/listHouseholds/index.ts', () => ({
  listHouseholds,
}));

const client = {} as DynamoDBDocumentClient;

describe('listMyHouseholds', () => {
  beforeEach(() => {
    listHouseholds.mockReset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('lists the signed-in user’s households', async () => {
    const households = [{ id: 'hh-1', name: 'Home', role: 'owner' }];
    listHouseholds.mockResolvedValue(households);

    const result = await listMyHouseholds({ sub: 'sub-9' } as AuthenticatedUser, client);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ households });
    expect(listHouseholds).toHaveBeenCalledWith(expect.anything(), 'sub-9');
  });
});
