import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { startSignIn } from '../../services/session/startSignIn';
import { useStartSignInMutation } from './index';

vi.mock('../../services/session/startSignIn', () => ({ startSignIn: vi.fn() }));

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      {children}
    </RemoteConfigContext.Provider>
  </QueryClientProvider>
);

describe('useStartSignInMutation', () => {
  it('calls startSignIn and returns its result', async () => {
    vi.mocked(startSignIn).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useStartSignInMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('jess@example.com')).resolves.toEqual({ ok: true });
    });
    expect(startSignIn).toHaveBeenCalledWith('/api/v1/auth/start', 'jess@example.com');
  });

  it('registers under its mutation name', async () => {
    vi.mocked(startSignIn).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useStartSignInMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('jess@example.com');
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['startSignIn']);
  });
});
