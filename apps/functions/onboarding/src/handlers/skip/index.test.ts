import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { SKIPPABLE_SECTIONS } from '@fridgeboard/lambda-kit/utils/buildOnboarding/constants.ts';
import { skipSection } from './index.ts';

const getProfile = vi.hoisted(() => vi.fn());
const saveSkippedSections = vi.hoisted(() => vi.fn());
const pendingOnboarding = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/profile/index.ts', () => ({
  getProfile,
  saveSkippedSections,
}));
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

const [SKIPPABLE] = [...SKIPPABLE_SECTIONS];
const skipping = (sectionId: string | undefined) =>
  userFor({ pathParameters: sectionId === undefined ? {} : { sectionId } });

describe('skipSection', () => {
  beforeEach(() => {
    getProfile.mockReset().mockResolvedValue(PROFILE);
    saveSkippedSections.mockReset().mockResolvedValue({ email: PROFILE.email });
    pendingOnboarding.mockReset().mockResolvedValue(SECTIONS);
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('remembers the skipped section and lists what is left', async () => {
    const result = await skipSection(skipping(SKIPPABLE), client);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ sections: SECTIONS });
    expect(saveSkippedSections).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'sub-1', skippedSections: [SKIPPABLE] }),
    );
    expect(pendingOnboarding).toHaveBeenCalledWith(expect.anything(), {
      sub: 'sub-1',
      profile: { ...PROFILE, skippedSections: [SKIPPABLE] },
      isAdmin: false,
    });
  });

  it('does not write again when the section was already skipped', async () => {
    getProfile.mockResolvedValue({ ...PROFILE, skippedSections: [SKIPPABLE] });

    const result = await skipSection(skipping(SKIPPABLE), client);

    expect(result.statusCode).toBe(200);
    expect(saveSkippedSections).not.toHaveBeenCalled();
  });

  it.each([
    ['a section that cannot be skipped', 'username'],
    ['an unknown section', 'nope'],
    ['no section', undefined],
  ])('refuses %s', async (_name, sectionId) => {
    const result = await skipSection(skipping(sectionId), client);

    expect(result.statusCode).toBe(400);
    expect(getProfile).not.toHaveBeenCalled();
    expect(saveSkippedSections).not.toHaveBeenCalled();
  });

  it('answers 404 when the user has no profile', async () => {
    getProfile.mockResolvedValue(undefined);

    expect(await skipSection(skipping(SKIPPABLE), client)).toEqual({ statusCode: 404 });
  });

  it('answers 404 when the profile disappeared before the write', async () => {
    saveSkippedSections.mockResolvedValue(undefined);

    expect(await skipSection(skipping(SKIPPABLE), client)).toEqual({ statusCode: 404 });
  });
});
