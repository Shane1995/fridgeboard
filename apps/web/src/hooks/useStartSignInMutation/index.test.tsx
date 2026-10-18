import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { startSignIn } from '../../services/session/startSignIn';
import { useStartSignInMutation } from './index';

vi.mock('../../services/session/startSignIn', () => ({ startSignIn: vi.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
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
});
