import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { SessionStatus } from '../../services/session/constants';
import { useSignOutMutation } from './index';
const { session, signOut } = createSession(SessionStatus.SignedIn);

const client = new QueryClient();
const wrapper = createSessionWrapper(session, client);

describe('useSignOutMutation', () => {
  it('calls signOut and returns its result', async () => {
    signOut.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSignOutMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync()).resolves.toEqual(undefined);
    });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('registers under its mutation name', async () => {
    signOut.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSignOutMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['signOut']);
  });
});
