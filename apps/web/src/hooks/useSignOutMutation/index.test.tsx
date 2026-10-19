import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { signOut } from '../../services/session/signOut';
import { useSignOutMutation } from './index';

vi.mock('../../services/session/signOut', () => ({ signOut: vi.fn() }));

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      {children}
    </RemoteConfigContext.Provider>
  </QueryClientProvider>
);

describe('useSignOutMutation', () => {
  it('calls signOut and returns its result', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSignOutMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync()).resolves.toEqual(undefined);
    });
    expect(signOut).toHaveBeenCalledWith('/api/v1/auth/sign-out');
  });

  it('registers under its mutation name', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSignOutMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['signOut']);
  });
});
