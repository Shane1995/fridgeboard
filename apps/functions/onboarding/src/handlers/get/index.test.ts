import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { getOnboarding } from './index.ts';

const getProfile = vi.hoisted(() => vi.fn());
const pendingOnboarding = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/profile/index.ts', () => ({ getProfile }));
vi.mock('@fridgeboard/lambda-kit/utils/pendingOnboarding/index.ts', () => ({ pendingOnboarding }));

const client = {} as DynamoDBDocumentClient;

const userFor = ({
  claims = {},
  pathParameters,
}: {
  claims?: Record<string, unknown>;
  pathParameters?: Record<string, string>;
} = {}) => ({ sub: 'sub-1', claims, event: { pathParameters } }) as unknown as AuthenticatedUser;

const PROFILE = {
  email: 'jess@example.com',
  username: null,
  canCreateHousehold: false,
  skippedSections: [] as string[],
};
const SECTIONS = [{ id: 'username' }];

describe('getOnboarding', () => {
  beforeEach(() => {
    getProfile.mockReset().mockResolvedValue(PROFILE);
    pendingOnboarding.mockReset().mockResolvedValue(SECTIONS);
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('lists the sections the user still has to do', async () => {
    const result = await getOnboarding(userFor(), client);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ sections: SECTIONS });
    expect(pendingOnboarding).toHaveBeenCalledWith(expect.anything(), {
      sub: 'sub-1',
      profile: PROFILE,
      isAdmin: false,
    });
  });

  it('treats a member of the admin group as an admin', async () => {
    await getOnboarding(userFor({ claims: { 'cognito:groups': ['admin'] } }), client);

    expect(pendingOnboarding).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ isAdmin: true }),
    );
  });

  it('answers 404 when the user has no profile', async () => {
    getProfile.mockResolvedValue(undefined);

    const result = await getOnboarding(userFor(), client);

    expect(result).toEqual({ statusCode: 404 });
    expect(pendingOnboarding).not.toHaveBeenCalled();
  });
});
