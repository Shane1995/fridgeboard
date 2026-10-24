import { renderHook, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../testUtils/createSession';
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

const setup = (respondToHouseholds: () => Response | Promise<Response>) => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  apiFetch.mockImplementation(async ({ path }: { path: string }) =>
    path.endsWith('/households')
      ? respondToHouseholds()
      : new Response(JSON.stringify(ME), { status: 200 }),
  );
  return renderHook(() => useProfile(), { wrapper: createProvidersWrapper(session) });
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
});
