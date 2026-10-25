import { renderHook, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../testUtils/createSession';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { TEST_WEB_CONFIGURATION } from '../../../../testUtils/webConfiguration';
import { useProfile } from './index';

const ME = {
  sub: 's',
  email: 'jess@example.com',
  username: 'jess',
  isAdmin: false,
  canCreateHousehold: false,
  hasOnboarding: false,
};
const HOUSEHOLDS = { households: [{ id: 'h1', name: 'Home', role: 'owner' }] };

const MEMBERS = { members: [{ id: 's', username: 'jess', role: 'owner' }] };

const withMembersFlag = (enabled: boolean) => ({
  ...TEST_WEB_CONFIGURATION,
  featureFlags: {
    ...TEST_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_HOUSEHOLD_INVITES]: enabled,
  },
});

const setup = (
  respondToHouseholds: () => Response | Promise<Response>,
  config = TEST_WEB_CONFIGURATION,
) => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  apiFetch.mockImplementation(async ({ path }: { path: string }) => {
    if (path.endsWith('/members')) {
      return new Response(JSON.stringify(MEMBERS), { status: 200 });
    }
    return path.endsWith('/households')
      ? respondToHouseholds()
      : new Response(JSON.stringify(ME), { status: 200 });
  });
  return {
    apiFetch,
    ...renderHook(() => useProfile(), { wrapper: createProvidersWrapper(session, config) }),
  };
};

describe('useProfile', () => {
  beforeEach(() => vi.resetAllMocks());

  it('loads the account and its households', async () => {
    const { result } = setup(() => new Response(JSON.stringify(HOUSEHOLDS), { status: 200 }));

    await waitFor(() => expect(result.current.households).toEqual(HOUSEHOLDS.households));
    expect(result.current.me).toEqual(ME);
    expect(result.current.isLoadingHouseholds).toBe(false);
  });

  it('starts with no households while loading', () => {
    const { result } = setup(() => new Promise<Response>(() => {}));

    expect(result.current.households).toEqual([]);
    expect(result.current.isLoadingHouseholds).toBe(true);
  });

  it('flags a households failure', async () => {
    const { result } = setup(() => new Response('{}', { status: 500 }));

    await waitFor(() => expect(result.current.hasHouseholdsError).toBe(true), { timeout: 5000 });
  });

  it('loads the members of the active household when the flag is on', async () => {
    const { result } = setup(
      () => new Response(JSON.stringify(HOUSEHOLDS), { status: 200 }),
      withMembersFlag(true),
    );

    await waitFor(() => expect(result.current.members).toEqual(MEMBERS.members));
    expect(result.current.showMembers).toBe(true);
  });

  it('does not ask for the members while the flag is off', async () => {
    const { result, apiFetch } = setup(
      () => new Response(JSON.stringify(HOUSEHOLDS), { status: 200 }),
      withMembersFlag(false),
    );

    await waitFor(() => expect(result.current.households).toEqual(HOUSEHOLDS.households));
    expect(result.current.showMembers).toBe(false);
    expect(result.current.members).toEqual([]);
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.stringContaining('/members') }),
    );
  });
});
