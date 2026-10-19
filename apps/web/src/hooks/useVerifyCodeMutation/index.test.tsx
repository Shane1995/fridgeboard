import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { verifyCode } from '../../services/session/verifyCode';
import { useVerifyCodeMutation } from './index';

vi.mock('../../services/session/verifyCode', () => ({ verifyCode: vi.fn() }));

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('useVerifyCodeMutation', () => {
  it('calls verifyCode and returns its result', async () => {
    vi.mocked(verifyCode).mockResolvedValue({ ok: false, next: 'enter-code' });
    const { result } = renderHook(() => useVerifyCodeMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('123456')).resolves.toEqual({
        ok: false,
        next: 'enter-code',
      });
    });
    expect(verifyCode).toHaveBeenCalledWith('123456', expect.anything());
  });

  it('registers under its mutation name', async () => {
    vi.mocked(verifyCode).mockResolvedValue({ ok: false, next: 'enter-code' });
    const { result } = renderHook(() => useVerifyCodeMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('123456');
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['verifyCode']);
  });
});
