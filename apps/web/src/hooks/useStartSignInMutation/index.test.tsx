import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';
import { useStartSignInMutation } from './index';

const startSignIn = vi.fn();
const session: SessionContextValue = {
  status: SessionStatus.SignedOut,
  startSignIn,
  verifyCode: vi.fn(),
  signOut: vi.fn(),
  refresh: vi.fn(),
  apiFetch: vi.fn(),
};

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  </QueryClientProvider>
);

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
