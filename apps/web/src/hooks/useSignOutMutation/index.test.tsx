import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';
import { useSignOutMutation } from './index';

const signOut = vi.fn();
const session: SessionContextValue = {
  status: SessionStatus.SignedIn,
  startSignIn: vi.fn(),
  verifyCode: vi.fn(),
  signOut,
  refresh: vi.fn(),
  apiFetch: vi.fn(),
};

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  </QueryClientProvider>
);

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
