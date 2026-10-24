import { useNavigate } from '@tanstack/react-router';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../testUtils/createSession';
import { useHome } from './index';

vi.mock('@tanstack/react-router', () => ({ useNavigate: vi.fn() }));

const ME = {
  sub: 's',
  email: 'jess@example.com',
  username: 'jess',
  isAdmin: false,
  canCreateHousehold: true,
  hasOnboarding: false,
};

const setup = () => {
  const navigate = vi.fn();
  vi.mocked(useNavigate).mockReturnValue(navigate);
  const { session, apiFetch, signOut } = createSession(SessionStatus.SignedIn);
  apiFetch.mockResolvedValue(new Response(JSON.stringify(ME), { status: 200 }));
  const { result } = renderHook(() => useHome(), { wrapper: createProvidersWrapper(session) });
  return { result, navigate, signOut };
};

describe('useHome', () => {
  beforeEach(() => vi.resetAllMocks());

  it('loads the signed-in account', async () => {
    const { result } = setup();

    await waitFor(() => expect(result.current.me).toEqual(ME));
  });

  it('signs out and then goes to the sign-in page', async () => {
    const { result, navigate, signOut } = setup();
    signOut.mockResolvedValue(undefined);

    await act(async () => result.current.handleSignOut());

    expect(signOut).toHaveBeenCalled();
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/sign-in', search: { redirect: '/' } }),
    );
  });

  it('still goes to the sign-in page when signing out fails', async () => {
    const { result, navigate, signOut } = setup();
    signOut.mockRejectedValue(new Error('network'));

    await act(async () => result.current.handleSignOut());

    await waitFor(() => expect(navigate).toHaveBeenCalled());
  });
});
