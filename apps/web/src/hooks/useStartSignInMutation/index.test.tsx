import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { startSignIn } from '../../services/session/startSignIn';
import { useStartSignInMutation } from './index';

vi.mock('../../services/session/startSignIn', () => ({ startSignIn: vi.fn() }));

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('useStartSignInMutation', () => {
  it('calls startSignIn and returns its result', async () => {
    vi.mocked(startSignIn).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useStartSignInMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('jess@example.com')).resolves.toEqual({ ok: true });
    });
    expect(startSignIn).toHaveBeenCalledWith('jess@example.com', expect.anything());
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
