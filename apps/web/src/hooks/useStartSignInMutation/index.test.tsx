import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { SessionStatus } from '../../services/session/constants';
import { useStartSignInMutation } from './index';
const { session, startSignIn } = createSession(SessionStatus.SignedOut);

const client = new QueryClient();
const wrapper = createSessionWrapper(session, client);

describe('useStartSignInMutation', () => {
  it('calls startSignIn and returns its result', async () => {
    startSignIn.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useStartSignInMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('jess@example.com')).resolves.toEqual({ ok: true });
    });
    expect(startSignIn).toHaveBeenCalledWith('jess@example.com');
  });

  it('registers under its mutation name', async () => {
    startSignIn.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useStartSignInMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('jess@example.com');
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['startSignIn']);
  });
});
