import { useNavigate } from '@tanstack/react-router';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../testUtils/createSession';
import { SettingsMenuAction } from '../../constants';
import { useSettingsMenu } from './index';

vi.mock('@tanstack/react-router', () => ({ useNavigate: vi.fn() }));

const setup = () => {
  const navigate = vi.fn();
  vi.mocked(useNavigate).mockReturnValue(navigate);
  const { session, signOut } = createSession(SessionStatus.SignedIn);
  const { result } = renderHook(() => useSettingsMenu(), {
    wrapper: createProvidersWrapper(session),
  });
  return { result, navigate, signOut };
};

describe('useSettingsMenu', () => {
  beforeEach(() => vi.resetAllMocks());

  it('opens the profile page', () => {
    const { result, navigate } = setup();

    act(() => result.current.handleAction(SettingsMenuAction.Profile));

    expect(navigate).toHaveBeenCalledWith({ to: '/profile' });
  });

  it('signs out and then goes to the sign-in page', async () => {
    const { result, navigate, signOut } = setup();
    signOut.mockResolvedValue(undefined);

    await act(async () => result.current.handleAction(SettingsMenuAction.SignOut));

    expect(signOut).toHaveBeenCalled();
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/sign-in', search: { redirect: '/' } }),
    );
  });

  it('still goes to the sign-in page when signing out fails', async () => {
    const { result, navigate, signOut } = setup();
    signOut.mockRejectedValue(new Error('network'));

    await act(async () => result.current.handleAction(SettingsMenuAction.SignOut));

    await waitFor(() => expect(navigate).toHaveBeenCalled());
  });
});
